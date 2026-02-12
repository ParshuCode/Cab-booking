# Payment Service - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Java 21 installed
- Maven installed
- MySQL running (port 3306)
- Kafka running (port 9092)
- Razorpay test account

---

## Step 1: Database Setup (30 seconds)

```sql
CREATE DATABASE cab_payment_db;
```

---

## Step 2: Get Razorpay Keys (1 minute)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Copy your **Key ID** and **Key Secret** (test mode)

---

## Step 3: Configure Environment (30 seconds)

### Windows
```cmd
set RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

### Linux/Mac
```bash
export RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
export RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 4: Run the Service (2 minutes)

```bash
cd payment-service
mvn spring-boot:run
```

Wait for: `Started PaymentApplication in X seconds`

---

## Step 5: Test It! (1 minute)

### Health Check
```bash
curl http://localhost:8085/api/payments/health
```

Expected: `{"status":"UP","service":"payment-service"}`

### Create Test Payment
```bash
curl -X POST http://localhost:8085/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "TEST123",
    "rideFare": 500.00,
    "paymentMethod": "razorpay"
  }'
```

Expected: Razorpay order details with `razorpayOrderId`

---

## 🎉 You're Done!

The payment service is now running on **http://localhost:8085**

---

## Next Steps

### 1. Integrate with Frontend
See `INTEGRATION_GUIDE.md` for React/JavaScript examples

### 2. Add Kafka Consumer to booking-service
See `INTEGRATION_GUIDE.md` Step 6

### 3. Test Complete Flow
1. Complete a ride
2. Click "Pay Now"
3. Use test card: `4111 1111 1111 1111`
4. Verify payment
5. Check Kafka event published

---

## Common Issues

### "Razorpay keys not configured"
**Fix:** Set environment variables (Step 3)

### "Connection refused to MySQL"
**Fix:** Start MySQL and create database (Step 1)

### "Cannot connect to Kafka"
**Fix:** Start Kafka broker on port 9092

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/create-order` | Create payment order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments/booking/{id}` | Get payment status |
| GET | `/api/payments/health` | Health check |

---

## Test Cards (Razorpay Test Mode)

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success ✅ |
| 4000 0000 0000 0002 | Failure ❌ |

CVV: Any 3 digits  
Expiry: Any future date

---

## Documentation

- **README.md** - Full documentation
- **API_REFERENCE.md** - API details
- **INTEGRATION_GUIDE.md** - Integration steps
- **VALIDATION_CHECKLIST.md** - Deployment checklist

---

## Support

Need help? Check the logs:
```bash
tail -f payment-service/logs/application.log
```

---

**Port:** 8085  
**Database:** cab_payment_db  
**Kafka Topic:** ride.payment.completed  

✅ **Ready to accept payments!** 🚖💳
