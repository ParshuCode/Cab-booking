package com.cabbooking.payment.kafka.event;

import java.time.Instant;

public class RidePaymentCompletedEvent {
    private String bookingId;
    private String paymentId;
    private Double fare;
    private String status;
    private String completedAt;

    public RidePaymentCompletedEvent() {
    }

    public RidePaymentCompletedEvent(String bookingId, String paymentId, Double fare, String status) {
        this.bookingId = bookingId;
        this.paymentId = paymentId;
        this.fare = fare;
        this.status = status;
        this.completedAt = Instant.now().toString();
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public Double getFare() {
        return fare;
    }

    public void setFare(Double fare) {
        this.fare = fare;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(String completedAt) {
        this.completedAt = completedAt;
    }
}
