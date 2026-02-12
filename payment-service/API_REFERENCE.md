# Payment Service - API Quick Reference

## Base URL
```
http://localhost:8085/api/payments
```

## Endpoints

### 1. Create Payment Order
**POST** `/create-order`

Creates a Razorpay payment order for a completed ride.

**Request:**
```json
{
  "bookingId": "BOOK123",
  "rideFare": 520.00,
  "paymentMethod": "razorpay",
  "customerName": "John Doe"
}
```

**Response (200 OK):**
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

**Error Responses:**
- `400` - Invalid request (missing fields, invalid fare)
- `502` - Razorpay error
- `500` - Internal server error

---

### 2. Verify Payment
**POST** `/verify`

Verifies Razorpay payment signature and publishes Kafka event.

**Request:**
```json
{
  "bookingId": "BOOK123",
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "razorpaySignature": "signature_hash"
}
```

**Response (200 OK):**
```json
{
  "verified": true,
  "status": "SUCCESS",
  "message": "Payment verified successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "verified": false,
  "status": "FAILED",
  "message": "Payment verification failed"
}
```

---

### 3. Get Payment by Booking ID
**GET** `/booking/{bookingId}`

Retrieves payment details for a specific booking.

**Response (200 OK):**
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

**Response (404):** Payment not found

---

### 4. Get Payment by Payment ID
**GET** `/{paymentId}`

Retrieves payment details by payment ID.

**Response (200 OK):**
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

**Response (404):** Payment not found

---

### 5. Health Check
**GET** `/health`

Service health check endpoint.

**Response (200 OK):**
```json
{
  "status": "UP",
  "service": "payment-service"
}
```

---

## Kafka Events

### Published Event: `ride.payment.completed`

**Trigger:** After payment verification (success or failure)

**Payload:**
```json
{
  "bookingId": "BOOK123",
  "paymentId": "pay_abc456",
  "fare": 520.00,
  "status": "SUCCESS",
  "completedAt": "2026-02-12T15:30:00.000Z"
}
```

**Status Values:**
- `SUCCESS` - Payment verified successfully
- `FAILED` - Payment verification failed

---

## Payment Status Lifecycle

```
CREATED → SUCCESS
        ↘ FAILED
```

- **CREATED**: Payment order created in Razorpay
- **SUCCESS**: Payment verified successfully
- **FAILED**: Payment verification failed

---

## cURL Examples

### Create Payment Order
```bash
curl -X POST http://localhost:8085/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOK123",
    "rideFare": 520.00,
    "paymentMethod": "razorpay",
    "customerName": "John Doe"
  }'
```

### Verify Payment
```bash
curl -X POST http://localhost:8085/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOK123",
    "razorpayOrderId": "order_xyz123",
    "razorpayPaymentId": "pay_abc456",
    "razorpaySignature": "signature_hash"
  }'
```

### Get Payment by Booking ID
```bash
curl http://localhost:8085/api/payments/booking/BOOK123
```

### Health Check
```bash
curl http://localhost:8085/api/payments/health
```

---

## JavaScript/React Examples

### Create Payment Order
```javascript
const createPaymentOrder = async (bookingId, rideFare) => {
  const response = await fetch('http://localhost:8085/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId,
      rideFare,
      paymentMethod: 'razorpay',
      customerName: 'User Name'
    })
  });
  return await response.json();
};
```

### Verify Payment
```javascript
const verifyPayment = async (verifyData) => {
  const response = await fetch('http://localhost:8085/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verifyData)
  });
  return await response.json();
};
```

### Get Payment Status
```javascript
const getPaymentStatus = async (bookingId) => {
  const response = await fetch(`http://localhost:8085/api/payments/booking/${bookingId}`);
  return await response.json();
};
```

---

## Razorpay Integration

### Test Cards

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Razorpay Checkout Options
```javascript
const options = {
  key: orderData.keyId,
  amount: orderData.amount,
  currency: orderData.currency,
  order_id: orderData.razorpayOrderId,
  name: 'Cab Booking',
  description: `Payment for Booking ${orderData.bookingId}`,
  handler: async (response) => {
    // Verify payment
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
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 404 | Not Found (payment not found) |
| 500 | Internal Server Error |
| 502 | Bad Gateway (Razorpay error) |

---

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `RAZORPAY_KEY_ID` | Yes | - |
| `RAZORPAY_KEY_SECRET` | Yes | - |
| `KAFKA_BOOTSTRAP_SERVERS` | No | `localhost:9092` |
| `SPRING_DATASOURCE_URL` | No | `jdbc:mysql://localhost:3306/cab_payment_db` |
| `RIDE_PAYMENT_COMPLETED_TOPIC` | No | `ride.payment.completed` |

---

## Common Issues

### Payment Order Creation Fails
**Cause:** Razorpay keys not configured
**Solution:** Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### Payment Verification Fails
**Cause:** Invalid signature
**Solution:** Ensure frontend passes correct signature from Razorpay

### Kafka Event Not Published
**Cause:** Kafka not running
**Solution:** Start Kafka broker and verify connection

---

## Support

For detailed documentation, see:
- `README.md` - Service overview
- `INTEGRATION_GUIDE.md` - Integration steps
- `VALIDATION_CHECKLIST.md` - Deployment checklist
