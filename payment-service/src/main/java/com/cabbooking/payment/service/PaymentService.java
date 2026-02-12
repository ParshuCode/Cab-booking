package com.cabbooking.payment.service;

import com.cabbooking.payment.config.RazorpayConfig;
import com.cabbooking.payment.dto.CreateOrderRequest;
import com.cabbooking.payment.dto.PaymentResponse;
import com.cabbooking.payment.dto.VerifyPaymentRequest;
import com.cabbooking.payment.gateway.RazorpayGateway;
import com.cabbooking.payment.kafka.event.RidePaymentCompletedEvent;
import com.cabbooking.payment.kafka.producer.PaymentCompletedProducer;
import com.cabbooking.payment.model.Payment;
import com.cabbooking.payment.repository.PaymentRepository;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final RazorpayConfig razorpayConfig;
    private final RazorpayGateway razorpayGateway;
    private final PaymentCompletedProducer paymentCompletedProducer;

    public PaymentService(PaymentRepository paymentRepository,
                          RazorpayConfig razorpayConfig,
                          RazorpayGateway razorpayGateway,
                          PaymentCompletedProducer paymentCompletedProducer) {
        this.paymentRepository = paymentRepository;
        this.razorpayConfig = razorpayConfig;
        this.razorpayGateway = razorpayGateway;
        this.paymentCompletedProducer = paymentCompletedProducer;
    }

    @Transactional
    public PaymentResponse createPaymentOrder(CreateOrderRequest request) throws RazorpayException {
        if (request.getBookingId() == null || request.getBookingId().isBlank()) {
            throw new IllegalArgumentException("bookingId is required");
        }
        if (request.getRideFare() == null || request.getRideFare() <= 0) {
            throw new IllegalArgumentException("rideFare must be greater than zero");
        }

        // Check if payment order already exists for this booking
        Optional<Payment> existing = paymentRepository.findByBookingId(request.getBookingId());
        if (existing.isPresent() && existing.get().getRazorpayOrderId() != null) {
            Payment payment = existing.get();
            long amountInPaise = Math.round(payment.getRideFare() * 100);
            return new PaymentResponse(
                    payment.getBookingId(),
                    payment.getRazorpayOrderId(),
                    razorpayConfig.getKeyId(),
                    amountInPaise,
                    payment.getCurrency() == null ? razorpayConfig.getCurrency() : payment.getCurrency(),
                    payment.getStatus()
            );
        }

        // Create Razorpay order
        PaymentResponse razorpayResponse = razorpayGateway.createOrder(request);

        // Save payment record
        Payment payment = existing.orElse(new Payment());
        payment.setBookingId(request.getBookingId());
        payment.setRideFare(request.getRideFare());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setCurrency(razorpayConfig.getCurrency());
        payment.setRazorpayOrderId(razorpayResponse.getRazorpayOrderId());
        payment.setStatus("CREATED");
        payment.setTimestamp(LocalDateTime.now());
        paymentRepository.save(payment);

        log.info("Created payment order for bookingId={}, razorpayOrderId={}", 
                request.getBookingId(), razorpayResponse.getRazorpayOrderId());

        return razorpayResponse;
    }

    @Transactional
    public boolean verifyPayment(VerifyPaymentRequest request) {
        if (request.getBookingId() == null || request.getBookingId().isBlank()
                || request.getRazorpayOrderId() == null || request.getRazorpayOrderId().isBlank()
                || request.getRazorpayPaymentId() == null || request.getRazorpayPaymentId().isBlank()
                || request.getRazorpaySignature() == null || request.getRazorpaySignature().isBlank()) {
            log.error("Missing required fields in payment verification request");
            return false;
        }

        Optional<Payment> paymentOpt = paymentRepository.findByBookingId(request.getBookingId());
        if (paymentOpt.isEmpty()) {
            log.error("Payment record not found for bookingId={}", request.getBookingId());
            return false;
        }

        Payment payment = paymentOpt.get();

        // Verify Razorpay order ID matches
        if (!request.getRazorpayOrderId().equals(payment.getRazorpayOrderId())) {
            payment.setStatus("FAILED");
            payment.setTimestamp(LocalDateTime.now());
            paymentRepository.save(payment);
            log.error("Razorpay order ID mismatch for bookingId={}", request.getBookingId());
            return false;
        }

        // Verify signature
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        String expectedSignature = hmacSha256(payload, razorpayConfig.getKeySecret());

        boolean verified = MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                request.getRazorpaySignature().getBytes(StandardCharsets.UTF_8)
        );

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setTimestamp(LocalDateTime.now());

        if (verified) {
            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);
            
            // Publish Kafka event ONLY after successful payment
            RidePaymentCompletedEvent event = new RidePaymentCompletedEvent(
                    payment.getBookingId(),
                    payment.getRazorpayPaymentId(),
                    payment.getRideFare(),
                    "SUCCESS"
            );
            paymentCompletedProducer.publish(event);
            
            log.info("Payment verified successfully for bookingId={}, paymentId={}", 
                    payment.getBookingId(), payment.getRazorpayPaymentId());
            return true;
        }

        payment.setStatus("FAILED");
        paymentRepository.save(payment);
        
        // Publish failure event
        RidePaymentCompletedEvent event = new RidePaymentCompletedEvent(
                payment.getBookingId(),
                payment.getRazorpayPaymentId(),
                payment.getRideFare(),
                "FAILED"
        );
        paymentCompletedProducer.publish(event);
        
        log.error("Payment verification failed for bookingId={}", payment.getBookingId());
        return false;
    }

    private String hmacSha256(String payload, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to compute payment signature", e);
        }
    }

    public Optional<Payment> getPaymentByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    public Optional<Payment> getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId);
    }
}
