# Payment Service - Cab Booking Application

## Overview

The **payment-service** is a dedicated Maven microservice for handling post-ride payments in the cab booking application. It integrates with Razorpay for payment processing and uses Kafka for event-driven communication with other services.

## ⚠️ Critical Business Rule

**Payment can ONLY occur AFTER ride completion.**

The correct flow is:
1. Cab selection
2. Booking created
3. Ride starts
4. **Ride completed** ✅
5. Payment UI opens
6. Payment success
7. User feedback (user → system ONLY)

## Architecture

### Technology Stack
- **Java 21**
- **Spring Boot 3.5.10**
- **Spring Data JPA** (MySQL)
- **Spring Kafka**
- **Razorpay Java SDK 1.4.8**
- **Maven**
- **Docker**

### Package Structure
```
com.cabbooking.payment/
├── PaymentApplication.java
├── config/
│   ├── RazorpayConfig.java
│   └── KafkaConfig.java
├── controller/
│   └── PaymentController.java
├── service/
│   └── PaymentService.java
├── gateway/
│   └── RazorpayGateway.java
├── dto/
│   ├── CreateOrderRequest.java
│   ├── VerifyPaymentRequest.java
│   └── PaymentResponse.java
├── model/
│   └── Payment.java
├── repository/
│   └── PaymentRepository.java
├── kafka/
│   ├── producer/
│   │   └── PaymentCompletedProducer.java
│   └── event/
│       └── RidePaymentCompletedEvent.java
└── exception/
    └── PaymentException.java
```

## API Endpoints

### 1. Create Payment Order (POST)
**Endpoint:** `/api/payments/create-order`

**Description:** Creates a Razorpay payment order for a completed ride.

**Request Body:**
```json
{
  "bookingId": "BOOK123",
  "rideFare": 520.00,
  "paymentMethod": "razorpay",
  "customerName": "John Doe"
}
```

**Response:**
```json
{
  "bookingId": "BOOK123",
  "razorpayOrderId": "order_xyz123",
  "keyId": "rzp_test_xxxxx",
  "amount": 52000,
  "currency": "INR",
  "status": "CREATED"
}
```

### 2. Verify Payment (POST)
**Endpoint:** `/api/payments/verify`

**Description:** Verifies Razorpay payment signature and publishes Kafka event on success.

**Request Body:**
```json
{
  "bookingId": "BOOK123",
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "razorpaySignature": "signature_hash"
}
```

**Response:**
```json
{
  "verified": true,
  "status": "SUCCESS",
  "message": "Payment verified successfully"
}
```

### 3. Get Payment by Booking ID (GET)
**Endpoint:** `/api/payments/booking/{bookingId}`

**Response:**
```json
{
  "paymentId": 1,
  "bookingId": "BOOK123",
  "rideFare": 520.00,
  "status": "SUCCESS",
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "timestamp": "2026-02-12T15:30:00"
}
```

### 4. Health Check (GET)
**Endpoint:** `/api/payments/health`

**Response:**
```json
{
  "status": "UP",
  "service": "payment-service"
}
```

## Kafka Integration

### Producer

**Topic:** `ride.payment.completed`

**Event Payload:**
```json
{
  "bookingId": "BOOK123",
  "paymentId": "pay_abc456",
  "fare": 520.00,
  "status": "SUCCESS",
  "completedAt": "2026-02-12T15:30:00.000Z"
}
```

**When Published:**
- ONLY after successful payment verification
- Also published on payment failure with status "FAILED"

### Consumer (booking-service)

The `booking-service` should consume this event to:
1. Mark the ride as PAID
2. Enable user feedback submission

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | MySQL database URL | `jdbc:mysql://localhost:3306/cab_payment_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `root` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address | `localhost:9092` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | (required) |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | (required) |
| `RIDE_PAYMENT_COMPLETED_TOPIC` | Kafka topic name | `ride.payment.completed` |
| `EUREKA_DEFAULT_ZONE` | Eureka server URL | `http://localhost:8761/eureka` |

### application.yml

The service uses environment-safe configuration. No secrets are hardcoded.

## Database Schema

### Table: `payments`

| Column | Type | Constraints |
|--------|------|-------------|
| `payment_id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| `booking_id` | VARCHAR(255) | NOT NULL, UNIQUE |
| `ride_fare` | DOUBLE | |
| `razorpay_order_id` | VARCHAR(255) | UNIQUE |
| `razorpay_payment_id` | VARCHAR(255) | |
| `razorpay_signature` | VARCHAR(255) | |
| `currency` | VARCHAR(10) | |
| `status` | VARCHAR(50) | |
| `payment_method` | VARCHAR(50) | |
| `timestamp` | DATETIME | |

**Status Values:**
- `CREATED` - Payment order created
- `SUCCESS` - Payment verified successfully
- `FAILED` - Payment verification failed

## Build & Run

### Local Development

1. **Set environment variables:**
```bash
set RAZORPAY_KEY_ID=your_key_id
set RAZORPAY_KEY_SECRET=your_key_secret
```

2. **Build the project:**
```bash
mvn clean package
```

3. **Run the service:**
```bash
java -jar target/payment-service-0.0.1-SNAPSHOT.jar
```

### Docker

1. **Build Docker image:**
```bash
docker build -t payment-service:latest .
```

2. **Run container:**
```bash
docker run -p 8085:8085 \
  -e RAZORPAY_KEY_ID=your_key_id \
  -e RAZORPAY_KEY_SECRET=your_key_secret \
  -e KAFKA_BOOTSTRAP_SERVERS=kafka:9092 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/cab_payment_db \
  payment-service:latest
```

## Frontend Integration

### Payment Flow

1. **After ride completion**, display "Pay Now" button
2. **On button click**, call `/api/payments/create-order`
3. **Open Razorpay Checkout** with the response data
4. **On payment success**, call `/api/payments/verify`
5. **Show success screen** and enable feedback form

### Example Frontend Code (React)

```javascript
// Step 1: Create payment order after ride completion
const createPaymentOrder = async (bookingId, rideFare) => {
  const response = await fetch('http://localhost:8085/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId,
      rideFare,
      paymentMethod: 'razorpay',
      customerName: 'John Doe'
    })
  });
  return await response.json();
};

// Step 2: Open Razorpay checkout
const openRazorpay = (orderData) => {
  const options = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    order_id: orderData.razorpayOrderId,
    name: 'Cab Booking',
    description: `Payment for Booking ${orderData.bookingId}`,
    handler: async (response) => {
      // Step 3: Verify payment
      await verifyPayment({
        bookingId: orderData.bookingId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      });
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
};

// Step 3: Verify payment
const verifyPayment = async (verifyData) => {
  const response = await fetch('http://localhost:8085/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verifyData)
  });
  const result = await response.json();
  if (result.verified) {
    // Show success screen and feedback form
    showPaymentSuccess();
  } else {
    // Show error
    showPaymentError();
  }
};
```

## Testing

### Manual Testing

1. **Create payment order:**
```bash
curl -X POST http://localhost:8085/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOK123",
    "rideFare": 520.00,
    "paymentMethod": "razorpay"
  }'
```

2. **Check payment status:**
```bash
curl http://localhost:8085/api/payments/booking/BOOK123
```

## Validation Checklist

- ✅ Payment UI opens only after ride completion
- ✅ Razorpay order creation works
- ✅ Payment verification works
- ✅ Kafka event is published after verification
- ✅ No food-booking logic remains
- ✅ All terminology adapted to cab booking
- ✅ Environment variables used for secrets
- ✅ Docker-ready

## Security Notes

1. **Never commit Razorpay keys** to version control
2. **Always use HTTPS** in production
3. **Validate all inputs** on the backend
4. **Verify payment signatures** before marking as successful
5. **Use environment variables** for all sensitive configuration

## Troubleshooting

### Issue: Razorpay keys not configured
**Solution:** Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` environment variables

### Issue: Kafka connection failed
**Solution:** Ensure Kafka is running and `KAFKA_BOOTSTRAP_SERVERS` is correct

### Issue: Database connection failed
**Solution:** Verify MySQL is running and credentials are correct

### Issue: Payment verification fails
**Solution:** Check that the Razorpay signature is being passed correctly from frontend

## License

This service is part of the Cab Booking Application.
