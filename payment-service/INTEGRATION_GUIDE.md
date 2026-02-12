# Payment Service Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the payment-service with the existing cab booking application.

## Prerequisites

- ✅ `booking-service` is running
- ✅ `cab-service` is running
- ✅ `user-service` is running
- ✅ MySQL database is running
- ✅ Kafka broker is running
- ✅ Razorpay account created (test mode)

## Step 1: Database Setup

Create the payment database:

```sql
CREATE DATABASE IF NOT EXISTS cab_payment_db;
USE cab_payment_db;

-- The payments table will be auto-created by JPA
-- But you can verify with:
SHOW TABLES;
```

## Step 2: Configure Razorpay

1. **Sign up** at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. **Get test keys** from Settings → API Keys
3. **Copy** the Key ID and Key Secret

## Step 3: Set Environment Variables

### Windows (Command Prompt)
```cmd
set RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
set KAFKA_BOOTSTRAP_SERVERS=localhost:9092
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/cab_payment_db
set SPRING_DATASOURCE_USERNAME=root
set SPRING_DATASOURCE_PASSWORD=yourpassword
```

### Linux/Mac
```bash
export RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
export RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/cab_payment_db
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=yourpassword
```

## Step 4: Build and Run Payment Service

```bash
cd payment-service
mvn clean package
java -jar target/payment-service-0.0.1-SNAPSHOT.jar
```

The service will start on port **8085**.

## Step 5: Verify Service is Running

```bash
curl http://localhost:8085/api/payments/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "payment-service"
}
```

## Step 6: Update booking-service (Kafka Consumer)

Add a Kafka consumer in `booking-service` to listen for payment completion events:

### Add Dependency to booking-service pom.xml

```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

### Create Event Class

```java
package com.cabbooking.booking.kafka.event;

public class RidePaymentCompletedEvent {
    private String bookingId;
    private String paymentId;
    private Double fare;
    private String status;
    private String completedAt;
    
    // Getters and setters
}
```

### Create Kafka Consumer

```java
package com.cabbooking.booking.kafka.consumer;

import com.cabbooking.booking.kafka.event.RidePaymentCompletedEvent;
import com.cabbooking.booking.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentCompletedConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaymentCompletedConsumer.class);
    
    private final BookingService bookingService;
    private final ObjectMapper objectMapper;

    public PaymentCompletedConsumer(BookingService bookingService, ObjectMapper objectMapper) {
        this.bookingService = bookingService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "ride.payment.completed", groupId = "booking-service-group")
    public void handlePaymentCompleted(String message) {
        try {
            RidePaymentCompletedEvent event = objectMapper.readValue(message, RidePaymentCompletedEvent.class);
            log.info("Received payment completed event for bookingId={}, status={}", 
                    event.getBookingId(), event.getStatus());
            
            if ("SUCCESS".equals(event.getStatus())) {
                // Mark booking as PAID
                bookingService.markBookingAsPaid(event.getBookingId());
                log.info("Marked booking {} as PAID", event.getBookingId());
            } else {
                log.warn("Payment failed for booking {}", event.getBookingId());
            }
        } catch (Exception e) {
            log.error("Error processing payment completed event", e);
        }
    }
}
```

### Update BookingService

Add method to mark booking as paid:

```java
@Transactional
public void markBookingAsPaid(String bookingId) {
    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    
    booking.setPaymentStatus("PAID");
    booking.setUpdatedAt(LocalDateTime.now());
    bookingRepository.save(booking);
}
```

### Update Booking Entity

Add payment status field:

```java
@Column(name = "payment_status")
private String paymentStatus = "PENDING"; // PENDING, PAID, FAILED
```

## Step 7: Frontend Integration

### Install Razorpay SDK

Add to your HTML:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

Or for React:
```bash
npm install react-razorpay
```

### Create Payment Component

```jsx
import React, { useState } from 'react';

const PaymentComponent = ({ bookingId, rideFare, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Step 1: Create payment order
      const orderResponse = await fetch('http://localhost:8085/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingId,
          rideFare: rideFare,
          paymentMethod: 'razorpay',
          customerName: 'User Name'
        })
      });
      
      const orderData = await orderResponse.json();
      
      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.razorpayOrderId,
        name: 'Cab Booking',
        description: `Payment for Booking ${bookingId}`,
        handler: async (response) => {
          // Step 3: Verify payment
          const verifyResponse = await fetch('http://localhost:8085/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });
          
          const verifyData = await verifyResponse.json();
          
          if (verifyData.verified) {
            onSuccess();
          } else {
            alert('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="pay-now-button"
    >
      {loading ? 'Processing...' : `Pay ₹${rideFare}`}
    </button>
  );
};

export default PaymentComponent;
```

### Update Ride Completion Screen

```jsx
import React, { useState } from 'react';
import PaymentComponent from './PaymentComponent';

const RideCompletedScreen = ({ booking }) => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    // Show feedback form
  };

  return (
    <div className="ride-completed">
      <h2>Ride Completed!</h2>
      <p>Booking ID: {booking.id}</p>
      <p>Total Fare: ₹{booking.fare}</p>
      
      {!paymentCompleted ? (
        <PaymentComponent 
          bookingId={booking.id}
          rideFare={booking.fare}
          onSuccess={handlePaymentSuccess}
        />
      ) : (
        <div>
          <h3>Payment Successful!</h3>
          <FeedbackForm bookingId={booking.id} />
        </div>
      )}
    </div>
  );
};
```

## Step 8: Testing the Complete Flow

### 1. Complete a Ride
- Create a booking
- Start the ride
- Complete the ride
- Verify ride status is "COMPLETED"

### 2. Initiate Payment
- Click "Pay Now" button
- Razorpay checkout should open

### 3. Test Payment (Test Mode)
Use Razorpay test cards:
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

### 4. Verify Payment
- Check payment verification response
- Verify Kafka event was published
- Verify booking status updated to "PAID"

### 5. Submit Feedback
- Feedback form should appear after successful payment
- Submit user feedback

## Step 9: Monitoring

### Check Kafka Topics

```bash
# List topics
kafka-topics.sh --list --bootstrap-server localhost:9092

# Consume messages
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic ride.payment.completed --from-beginning
```

### Check Database

```sql
USE cab_payment_db;
SELECT * FROM payments;
```

### Check Logs

```bash
# Payment service logs
tail -f payment-service/logs/application.log

# Booking service logs
tail -f booking-service/logs/application.log
```

## Step 10: Docker Compose Integration

Add payment-service to your `docker-compose.yml`:

```yaml
services:
  payment-service:
    build: ./payment-service
    ports:
      - "8085:8085"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/cab_payment_db
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=root
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
      - EUREKA_DEFAULT_ZONE=http://eureka:8761/eureka
    depends_on:
      - mysql
      - kafka
      - eureka
    networks:
      - cab-booking-network
```

## Troubleshooting

### Issue: Payment order creation fails
**Check:**
- Razorpay keys are set correctly
- Booking ID is unique
- Ride fare is greater than 0

### Issue: Payment verification fails
**Check:**
- Razorpay signature is being passed correctly
- Payment order exists in database
- Razorpay order ID matches

### Issue: Kafka event not received
**Check:**
- Kafka is running
- Topic `ride.payment.completed` exists
- Consumer group is configured correctly
- No serialization errors in logs

### Issue: Booking status not updating
**Check:**
- Kafka consumer is running in booking-service
- Consumer is listening to correct topic
- Database connection is working
- Transaction is committing

## Security Checklist

- ✅ Razorpay keys stored in environment variables
- ✅ No secrets in source code
- ✅ HTTPS enabled in production
- ✅ CORS configured properly
- ✅ Input validation on all endpoints
- ✅ Payment signature verification enabled
- ✅ Database credentials secured

## Performance Optimization

1. **Database Indexing:**
```sql
CREATE INDEX idx_booking_id ON payments(booking_id);
CREATE INDEX idx_razorpay_order_id ON payments(razorpay_order_id);
```

2. **Kafka Configuration:**
- Adjust partition count for higher throughput
- Configure consumer group for parallel processing

3. **Connection Pooling:**
- Configure HikariCP in application.yml
- Set appropriate pool size

## Next Steps

1. ✅ Set up monitoring (Prometheus + Grafana)
2. ✅ Configure alerts for payment failures
3. ✅ Implement retry mechanism for Kafka events
4. ✅ Add payment analytics dashboard
5. ✅ Implement refund functionality (if needed)

## Support

For issues or questions:
- Check logs in `payment-service/logs/`
- Review Kafka consumer logs
- Verify database state
- Test with Razorpay test mode first

---

**Remember:** Payment can ONLY occur AFTER ride completion! 🚖💳
