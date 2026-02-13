package com.cabbooking.cabservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Individual topic names - Producer topics
    public static final String DRIVER_LOCATION_UPDATED_TOPIC = "driver.location.updated";
    public static final String CAB_STATUS_UPDATED_TOPIC = "cab.status.updated";
    
    // Consumer topics
    public static final String BOOKING_ACCEPTED_TOPIC = "booking.accepted";
    public static final String RIDE_COMPLETED_TOPIC = "ride.completed";

    @Bean
    public NewTopic driverLocationUpdatedTopic() {
        return TopicBuilder.name(DRIVER_LOCATION_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000") // 7 days
                .config("cleanup.policy", "delete")
                .build();
    }

    @Bean
    public NewTopic cabStatusUpdatedTopic() {
        return TopicBuilder.name(CAB_STATUS_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000")
                .config("cleanup.policy", "delete")
                .build();
    }
}
