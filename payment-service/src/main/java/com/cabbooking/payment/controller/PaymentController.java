package com.cabbooking.payment.controller;

import com.cabbooking.payment.dto.CreateOrderRequest;
import com.cabbooking.payment.dto.PaymentResponse;
import com.cabbooking.payment.dto.VerifyPaymentRequest;
import com.cabbooking.payment.model.Payment;
import com.cabbooking.payment.service.PaymentService;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Create a Razorpay payment order for a completed ride
     * This endpoint should be called ONLY after ride completion
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(@RequestBody CreateOrderRequest request) {
        try {
            log.info("Creating payment order for bookingId={}, fare={}", 
                    request.getBookingId(), request.getRideFare());
            PaymentResponse response = paymentService.createPaymentOrder(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "INVALID_REQUEST");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RazorpayException e) {
            log.error("Razorpay error: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "RAZORPAY_ERROR");
            error.put("message", e.getMessage());
            return ResponseEntity.status(502).body(error);
        } catch (Exception e) {
            log.error("Unexpected error creating payment order", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "INTERNAL_ERROR");
            error.put("message", "An unexpected error occurred");
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Verify Razorpay payment signature
     * Publishes Kafka event on successful verification
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest request) {
        try {
            log.info("Verifying payment for bookingId={}", request.getBookingId());
            boolean verified = paymentService.verifyPayment(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("verified", verified);
            response.put("status", verified ? "SUCCESS" : "FAILED");
            response.put("message", verified ? "Payment verified successfully" : "Payment verification failed");
            
            if (verified) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            log.error("Error verifying payment", e);
            Map<String, Object> response = new HashMap<>();
            response.put("verified", false);
            response.put("status", "ERROR");
            response.put("message", "An error occurred during verification");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get payment details by booking ID
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBookingId(@PathVariable String bookingId) {
        return paymentService.getPaymentByBookingId(bookingId)
                .map(payment -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("paymentId", payment.getPaymentId());
                    response.put("bookingId", payment.getBookingId());
                    response.put("rideFare", payment.getRideFare());
                    response.put("status", payment.getStatus());
                    response.put("razorpayOrderId", payment.getRazorpayOrderId());
                    response.put("razorpayPaymentId", payment.getRazorpayPaymentId());
                    response.put("timestamp", payment.getTimestamp() != null ? payment.getTimestamp().toString() : null);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get payment details by payment ID
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long paymentId) {
        return paymentService.getPaymentById(paymentId)
                .map(payment -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("paymentId", payment.getPaymentId());
                    response.put("bookingId", payment.getBookingId());
                    response.put("rideFare", payment.getRideFare());
                    response.put("status", payment.getStatus());
                    response.put("razorpayOrderId", payment.getRazorpayOrderId());
                    response.put("razorpayPaymentId", payment.getRazorpayPaymentId());
                    response.put("timestamp", payment.getTimestamp() != null ? payment.getTimestamp().toString() : null);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "payment-service");
        return ResponseEntity.ok(response);
    }
}
