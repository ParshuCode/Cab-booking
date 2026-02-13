package com.cabbooking.paymentservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import com.cabbooking.paymentservice.config.KafkaConfig;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class PaymentEventProducer {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendPaymentEvent(String eventType, String message, Long entityId, Object data) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", eventType);
        event.put("message", message);
        event.put("timestamp", System.currentTimeMillis());
        event.put("entityId", entityId);
        event.put("data", data);

        String topic = getTopicForEventType(eventType);
        
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, String.valueOf(entityId), event);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                System.out.println("✅ KAFKA SUCCESS: [" + eventType + "] sent to topic [" + topic + "] - " + message);
                System.out.println("   Partition: " + result.getRecordMetadata().partition() + 
                                   ", Offset: " + result.getRecordMetadata().offset());
            } else {
                System.err.println("❌ KAFKA FAILED: [" + eventType + "] to topic [" + topic + "]: " + ex.getMessage());
                ex.printStackTrace();
            }
        });
    }

    private String getTopicForEventType(String eventType) {
        switch (eventType) {
            case "payment.created":
                return KafkaConfig.PAYMENT_CREATED_TOPIC;
            case "payment.success":
                return KafkaConfig.PAYMENT_SUCCESS_TOPIC;
            case "payment.failed":
                return KafkaConfig.PAYMENT_FAILED_TOPIC;
            default:
                throw new IllegalArgumentException("Unknown event type: " + eventType);
        }
    }
}
