package com.cabbooking.paymentservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Individual topic names
    public static final String PAYMENT_CREATED_TOPIC = "payment.created";
    public static final String PAYMENT_SUCCESS_TOPIC = "payment.success";
    public static final String PAYMENT_FAILED_TOPIC = "payment.failed";

    @Bean
    public NewTopic paymentCreatedTopic() {
        return TopicBuilder.name(PAYMENT_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000") // 7 days
                .config("cleanup.policy", "delete")
                .build();
    }

    @Bean
    public NewTopic paymentSuccessTopic() {
        return TopicBuilder.name(PAYMENT_SUCCESS_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000")
                .config("cleanup.policy", "delete")
                .build();
    }

    @Bean
    public NewTopic paymentFailedTopic() {
        return TopicBuilder.name(PAYMENT_FAILED_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000")
                .config("cleanup.policy", "delete")
                .build();
    }
}
