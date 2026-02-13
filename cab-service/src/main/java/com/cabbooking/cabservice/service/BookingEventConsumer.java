package com.cabbooking.cabservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import com.cabbooking.cabservice.model.Cab;
import com.cabbooking.cabservice.repository.CabRepository;

import java.util.Map;

@Service
public class BookingEventConsumer {

    @Autowired
    private CabRepository cabRepository;

    @Autowired
    private CabEventProducer cabEventProducer;

    @KafkaListener(
        topics = "booking.accepted",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeBookingAccepted(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        String eventType = (String) event.get("eventType");
        System.out.println("📥 KAFKA: Received [" + eventType + "] from partition " + partition + ", offset " + offset);

        try {
            handleBookingAccepted(event);
            acknowledgment.acknowledge();
            System.out.println("✅ Successfully processed and committed offset " + offset);
        } catch (Exception e) {
            System.err.println("❌ Error processing booking.accepted event: " + e.getMessage());
            e.printStackTrace();
            // Don't acknowledge - will retry
        }
    }

    @KafkaListener(
        topics = "ride.completed",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeRideCompleted(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        String eventType = (String) event.get("eventType");
        System.out.println("📥 KAFKA: Received [" + eventType + "] from partition " + partition + ", offset " + offset);

        try {
            handleRideCompleted(event);
            acknowledgment.acknowledge();
            System.out.println("✅ Successfully processed and committed offset " + offset);
        } catch (Exception e) {
            System.err.println("❌ Error processing ride.completed event: " + e.getMessage());
            e.printStackTrace();
            // Don't acknowledge - will retry
        }
    }

    private void handleBookingAccepted(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data != null && data.containsKey("cabId")) {
            Long cabId = getLongValue(data.get("cabId"));
            
            cabRepository.findById(cabId).ifPresent(cab -> {
                cab.setStatus(Cab.CabStatus.BUSY);
                cabRepository.save(cab);
                System.out.println("✅ Cab #" + cabId + " status set to BUSY");
                
                // Emit cab status updated event
                cabEventProducer.sendCabEvent(
                    "cab.status.updated",
                    "Cab #" + cabId + " is now BUSY",
                    cabId,
                    cab
                );
            });
        }
    }

    private void handleRideCompleted(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data != null && data.containsKey("cabId")) {
            Long cabId = getLongValue(data.get("cabId"));
            
            cabRepository.findById(cabId).ifPresent(cab -> {
                cab.setStatus(Cab.CabStatus.AVAILABLE);
                cabRepository.save(cab);
                System.out.println("✅ Cab #" + cabId + " status set to AVAILABLE");
                
                // Emit cab status updated event
                cabEventProducer.sendCabEvent(
                    "cab.status.updated",
                    "Cab #" + cabId + " is now AVAILABLE",
                    cabId,
                    cab
                );
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
