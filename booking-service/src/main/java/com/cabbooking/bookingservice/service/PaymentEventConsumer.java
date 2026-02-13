package com.cabbooking.bookingservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import com.cabbooking.bookingservice.model.Booking;
import com.cabbooking.bookingservice.repository.BookingRepository;

import java.util.Map;

@Service
public class PaymentEventConsumer {

    @Autowired
    private BookingRepository bookingRepository;

    @KafkaListener(
        topics = "payment.success",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePaymentSuccess(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        String eventType = (String) event.get("eventType");
        System.out.println("📥 KAFKA: Received [" + eventType + "] from partition " + partition + ", offset " + offset);

        try {
            handlePaymentSuccess(event);
            acknowledgment.acknowledge();
            System.out.println("✅ Successfully processed and committed offset " + offset);
        } catch (Exception e) {
            System.err.println("❌ Error processing payment.success event: " + e.getMessage());
            e.printStackTrace();
            // Don't acknowledge - will retry
        }
    }

    @KafkaListener(
        topics = "payment.failed",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePaymentFailed(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        String eventType = (String) event.get("eventType");
        System.out.println("📥 KAFKA: Received [" + eventType + "] from partition " + partition + ", offset " + offset);

        try {
            handlePaymentFailed(event);
            acknowledgment.acknowledge();
            System.out.println("✅ Successfully processed and committed offset " + offset);
        } catch (Exception e) {
            System.err.println("❌ Error processing payment.failed event: " + e.getMessage());
            e.printStackTrace();
            // Don't acknowledge - will retry
        }
    }

    private void handlePaymentSuccess(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data != null && data.containsKey("rideId")) {
            Long rideId = getLongValue(data.get("rideId"));
            
            bookingRepository.findById(rideId).ifPresent(booking -> {
                booking.setStatus(Booking.BookingStatus.COMPLETED);
                bookingRepository.save(booking);
                System.out.println("✅ Booking #" + rideId + " marked as COMPLETED after payment success");
            });
        }
    }

    private void handlePaymentFailed(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data != null && data.containsKey("rideId")) {
            Long rideId = getLongValue(data.get("rideId"));
            
            bookingRepository.findById(rideId).ifPresent(booking -> {
                booking.setStatus(Booking.BookingStatus.CANCELLED);
                bookingRepository.save(booking);
                System.out.println("⚠️ Booking #" + rideId + " cancelled due to payment failure");
            });
        }
    }

    private Long getLongValue(Object value) {
        if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else if (value instanceof Long) {
            return (Long) value;
        }
        return Long.parseLong(value.toString());
    }
}
