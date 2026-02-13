package com.cabbooking.notificationservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // All individual topic names
    public static final String BOOKING_CREATED_TOPIC = "booking.created";
    public static final String BOOKING_ACCEPTED_TOPIC = "booking.accepted";
    public static final String BOOKING_CANCELLED_TOPIC = "booking.cancelled";
    public static final String RIDE_COMPLETED_TOPIC = "ride.completed";
    
    public static final String PAYMENT_CREATED_TOPIC = "payment.created";
    public static final String PAYMENT_SUCCESS_TOPIC = "payment.success";
    public static final String PAYMENT_FAILED_TOPIC = "payment.failed";
    
    public static final String DRIVER_LOCATION_UPDATED_TOPIC = "driver.location.updated";
    public static final String CAB_STATUS_UPDATED_TOPIC = "cab.status.updated";
    
    public static final String NOTIFICATION_PUSH_TOPIC = "notification.push";

    @Bean
    public NewTopic notificationPushTopic() {
        return TopicBuilder.name(NOTIFICATION_PUSH_TOPIC)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000") // 7 days
                .config("cleanup.policy", "delete")
                .build();
    }
}
