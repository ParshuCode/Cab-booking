package com.cabbooking.cabservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import com.cabbooking.cabservice.config.KafkaConfig;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class CabEventProducer {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendCabEvent(String eventType, String message, Long entityId, Object data) {
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
            case "driver.location.updated":
                return KafkaConfig.DRIVER_LOCATION_UPDATED_TOPIC;
            case "cab.status.updated":
                return KafkaConfig.CAB_STATUS_UPDATED_TOPIC;
            default:
                throw new IllegalArgumentException("Unknown event type: " + eventType);
        }
    }
}
