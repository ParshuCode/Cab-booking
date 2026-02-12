package com.cabbooking.payment.kafka.producer;

import com.cabbooking.payment.kafka.event.RidePaymentCompletedEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class PaymentCompletedProducer {

    private static final Logger log = LoggerFactory.getLogger(PaymentCompletedProducer.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String topicName;

    public PaymentCompletedProducer(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            @Value("${app.kafka.ride-payment-completed-topic}") String topicName
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.topicName = topicName;
    }

    public void publish(RidePaymentCompletedEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(topicName, event.getBookingId(), payload);
            log.info("Published ride payment completed event: bookingId={}, status={}, topic={}, fare={}",
                    event.getBookingId(), event.getStatus(), topicName, event.getFare());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize ride payment completed event for bookingId={}", event.getBookingId(), e);
        }
    }
}
