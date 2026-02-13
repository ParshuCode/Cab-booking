package com.cabbooking.bookingservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Individual topic names
    public static final String BOOKING_CREATED_TOPIC = "booking.created";
    public static final String BOOKING_ACCEPTED_TOPIC = "booking.accepted";
    public static final String BOOKING_CANCELLED_TOPIC = "booking.cancelled";
    public static final String RIDE_COMPLETED_TOPIC = "ride.completed";
    
    // Topics to consume
    public static final String PAYMENT_SUCCESS_TOPIC = "payment.success";
    public static final String PAYMENT_FAILED_TOPIC = "payment.failed";

    @Bean
    public NewTopic bookingCreatedTopic() {
        return TopicBuilder.name(BOOKING_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000") // 7 days
                .config("cleanup.policy", "delete")
                .build();
    }

    @Bean
    public NewTopic bookingAcceptedTopic() {
        return TopicBuilder.name(BOOKING_ACCEPTED_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000")
                .config("cleanup.policy", "delete")
                .build();
    }

    @Bean
    public NewTopic bookingCancelledTopic() {
        return TopicBuilder.name(BOOKING_CANCELLED_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000")
                .config("cleanup.policy", "delete")
                .build();
    }

    @Bean
    public NewTopic rideCompletedTopic() {
        return TopicBuilder.name(RIDE_COMPLETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000")
                .config("cleanup.policy", "delete")
                .build();
    }
}
