package com.cabbooking.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationEventConsumer {

    @Autowired
    private NotificationBroadcastService broadcastService;

    // ==================== BOOKING EVENTS ====================

    @KafkaListener(topics = "booking.created", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeBookingCreated(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "booking.created", partition, offset, acknowledgment);
    }

    @KafkaListener(topics = "booking.accepted", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeBookingAccepted(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "booking.accepted", partition, offset, acknowledgment);
    }

    @KafkaListener(topics = "booking.cancelled", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeBookingCancelled(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "booking.cancelled", partition, offset, acknowledgment);
    }

    @KafkaListener(topics = "ride.completed", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeRideCompleted(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "ride.completed", partition, offset, acknowledgment);
    }

    // ==================== PAYMENT EVENTS ====================

    @KafkaListener(topics = "payment.created", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentCreated(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "payment.created", partition, offset, acknowledgment);
    }

    @KafkaListener(topics = "payment.success", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentSuccess(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "payment.success", partition, offset, acknowledgment);
    }

    @KafkaListener(topics = "payment.failed", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentFailed(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "payment.failed", partition, offset, acknowledgment);
    }

    // ==================== CAB EVENTS ====================

    @KafkaListener(topics = "driver.location.updated", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeDriverLocationUpdated(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "driver.location.updated", partition, offset, acknowledgment);
    }

    @KafkaListener(topics = "cab.status.updated", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCabStatusUpdated(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "cab.status.updated", partition, offset, acknowledgment);
    }

    // ==================== NOTIFICATION PUSH ====================

    @KafkaListener(topics = "notification.push", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeNotificationPush(
            @Payload Map<String, Object> event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        processEvent(event, "notification.push", partition, offset, acknowledgment);
    }

    // ==================== COMMON PROCESSING ====================

    private void processEvent(Map<String, Object> event, String expectedEventType, 
                             int partition, long offset, Acknowledgment acknowledgment) {
        String eventType = (String) event.get("eventType");
        String message = (String) event.get("message");
        Long entityId = getLongValue(event.get("entityId"));
        Object data = event.get("data");

        System.out.println("📥 KAFKA: Received [" + eventType + "] from partition " + partition + ", offset " + offset);

        try {
            broadcastService.broadcastNotification(eventType, message, entityId, data);
            acknowledgment.acknowledge();
            System.out.println("✅ Successfully processed and committed offset " + offset);
        } catch (Exception e) {
            System.err.println("❌ Error processing " + eventType + " event: " + e.getMessage());
            e.printStackTrace();
            // Don't acknowledge - will retry
        }
    }

    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else if (value instanceof Long) {
            return (Long) value;
        }
        try {
            return Long.parseLong(value.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
