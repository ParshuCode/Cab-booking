package com.cabbooking.bookingservice.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.cabbooking.bookingservice.model.Booking;
import com.cabbooking.bookingservice.model.BookingStatus;
import com.cabbooking.bookingservice.repository.BookingRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * PHASE 2: Kafka consumer for ride.payment.completed events
 * Listens for payment completion and updates booking status to PAID
 * Notifies driver that money has been credited
 */
@Component
public class PaymentCompletedConsumer {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @KafkaListener(
        topics = "${app.kafka.ride-payment-completed-topic:ride.payment.completed}",
        groupId = "booking-service-group"
    )
    public void handlePaymentCompleted(String message) {
        try {
            System.out.println("📥 Received payment completed event: " + message);
            
            // Parse the Kafka event
            JsonNode event = objectMapper.readTree(message);
            Long bookingId = event.get("bookingId").asLong();
            String paymentStatus = event.get("status").asText();
            Double fare = event.get("fare").asDouble();
            
            // Find the booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
            
            if ("SUCCESS".equals(paymentStatus)) {
                // Update booking status to PAID
                booking.setStatus(BookingStatus.PAID);
                bookingRepository.save(booking);
                
                System.out.println("✅ Booking " + bookingId + " marked as PAID");
                
                // Notify driver: Money Credited
                String driverNotification = String.format(
                    "{\"message\": \"💰 Money Credited!\", \"amount\": %.2f, \"bookingId\": %d}",
                    fare, bookingId
                );
                
                messagingTemplate.convertAndSend(
                    "/topic/driver/" + booking.getCabId() + "/payment-credited",
                    driverNotification
                );
                
                System.out.println("📤 Notified driver " + booking.getCabId() + " about payment");
                
                // Optionally notify user that payment was successful
                messagingTemplate.convertAndSend(
                    "/topic/user/" + booking.getUserId() + "/payment-success",
                    "{\"message\": \"Payment successful!\", \"bookingId\": " + bookingId + "}"
                );
                
            } else {
                // Payment failed
                System.out.println("❌ Payment failed for booking " + bookingId);
                booking.setStatus(BookingStatus.RIDE_ENDED); // Revert to RIDE_ENDED
                bookingRepository.save(booking);
                
                // Notify user about payment failure
                messagingTemplate.convertAndSend(
                    "/topic/user/" + booking.getUserId() + "/payment-failed",
                    "{\"message\": \"Payment failed. Please try again.\", \"bookingId\": " + bookingId + "}"
                );
            }
            
        } catch (Exception e) {
            System.err.println("Error processing payment completed event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
