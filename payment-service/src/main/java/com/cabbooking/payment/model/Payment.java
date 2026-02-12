package com.cabbooking.payment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(nullable = false, unique = true)
    private String bookingId;
    private Double rideFare;
    @Column(unique = true)
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private String currency;
    // Possible values: CREATED, SUCCESS, FAILED
    private String status; 
    private String paymentMethod; 
    private LocalDateTime timestamp;

    
    public Payment() {}

    public Payment(String bookingId, Double rideFare, String paymentMethod) {
        this.bookingId = bookingId;
        this.rideFare = rideFare;
        this.paymentMethod = paymentMethod;
        this.status = "CREATED";
        this.timestamp = LocalDateTime.now();
    }

  
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public Double getRideFare() { return rideFare; }
    public void setRideFare(Double rideFare) { this.rideFare = rideFare; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
