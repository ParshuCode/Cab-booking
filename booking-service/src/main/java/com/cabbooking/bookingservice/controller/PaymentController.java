package com.cabbooking.bookingservice.controller;

import com.cabbooking.bookingservice.model.Booking;
import com.cabbooking.bookingservice.model.Payment;
import com.cabbooking.bookingservice.repository.BookingRepository;
import com.cabbooking.bookingservice.repository.PaymentRepository;
import com.cabbooking.bookingservice.repository.NotificationRepository;
import com.cabbooking.bookingservice.model.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Payment payment) {
        Booking booking = bookingRepository.findById(payment.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStatus().equals(Booking.BookingStatus.COMPLETED)) {
            return ResponseEntity.badRequest().body("Ride must be completed before payment.");
        }

        payment.setTimestamp(java.time.LocalDateTime.now());
        payment.setStatus("COMPLETED");
        paymentRepository.save(payment);

        booking.setStatus(Booking.BookingStatus.PAID);
        bookingRepository.save(booking);

        // Notify Driver
        notificationRepository.save(new Notification(booking.getCabId(), "DRIVER", "Payment received for booking " + booking.getId(), "PAYMENT_RECEIVED"));

        return ResponseEntity.ok(payment);
    }
}
