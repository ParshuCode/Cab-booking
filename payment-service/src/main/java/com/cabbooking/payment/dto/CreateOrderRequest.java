package com.cabbooking.payment.dto;

public class CreateOrderRequest {
    private String bookingId;
    private Double rideFare;
    private String paymentMethod;
    private String customerName;

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public Double getRideFare() {
        return rideFare;
    }

    public void setRideFare(Double rideFare) {
        this.rideFare = rideFare;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
}
