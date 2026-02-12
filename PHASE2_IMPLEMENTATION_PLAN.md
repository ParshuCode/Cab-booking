# Phase 2: Bug Fixing & Flow Correction - Implementation Plan

## 🐞 Current Bugs Identified

### Critical Issues Found:

1. **BookingStatus Enum Missing Required States**
   - Current: `PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED`
   - Missing: `DRIVER_ACCEPTED`, `RIDE_ENDED`, `PAYMENT_PENDING`, `PAID`

2. **Driver Dashboard Has "Complete Ride" Button**
   - File: `DriverDashboardSimple.jsx` (line 396)
   - File: `DriverDashboard.jsx` (line 235)
   - File: `CabDriverDashboard.jsx` (line 624)
   - **BUG:** Driver can complete ride and trigger payment

3. **User Triggers COMPLETED Status Directly**
   - File: `UserRidePage.jsx` (line 116)
   - Current: User button sets status to `COMPLETED`
   - **BUG:** Should set to `RIDE_ENDED` first, then `PAID` after payment

4. **No Payment Integration in User Flow**
   - User clicks "Complete Ride & Pay" but no Razorpay integration
   - No Kafka event emission after payment

5. **No Kafka Consumer in booking-service**
   - Missing consumer for `ride.payment.completed` topic

## ✅ Required Fixes

### Backend Fixes

#### 1. Update BookingStatus Enum
**File:** `booking-service/src/main/java/com/cabbooking/bookingservice/model/BookingStatus.java`

```java
public enum BookingStatus {
    PENDING,           // Initial booking created
    DRIVER_ACCEPTED,   // Driver accepted the ride
    IN_PROGRESS,       // Ride started
    RIDE_ENDED,        // Driver marked ride as ended
    PAYMENT_PENDING,   // Waiting for user payment
    PAID,              // Payment successful
    COMPLETED,         // Fully completed (after payment + feedback)
    CANCELLED          // Booking cancelled
}
```

#### 2. Add Driver Endpoints (Restricted)
**File:** `booking-service/src/main/java/com/cabbooking/bookingservice/controller/BookingController.java`

Add:
```java
// Driver can only mark ride as ENDED
@PutMapping("/{id}/end-ride")
public ResponseEntity<?> endRide(@PathVariable Long id, @RequestParam Long driverId) {
    // Validate driver owns this booking
    // Update status: IN_PROGRESS → RIDE_ENDED
}
```

#### 3. Add Payment Validation
**File:** `payment-service/src/main/java/com/cabbooking/payment/service/PaymentService.java`

Update `createPaymentOrder`:
```java
// Validate ride status before creating payment
if (rideStatus != RIDE_ENDED && rideStatus != PAYMENT_PENDING) {
    throw new PaymentException("Payment can only be created after ride ends");
}
```

#### 4. Add Kafka Consumer
**File:** `booking-service/src/main/java/com/cabbooking/bookingservice/kafka/PaymentCompletedConsumer.java` (NEW)

```java
@KafkaListener(topics = "ride.payment.completed")
public void handlePaymentCompleted(String message) {
    // Parse event
    // Update booking status: PAYMENT_PENDING → PAID
    // Notify driver via WebSocket: "Money Credited"
}
```

#### 5. Update Kafka Event Payload
**File:** `payment-service/src/main/java/com/cabbooking/payment/kafka/event/RidePaymentCompletedEvent.java`

Add `driverId` and `userId`:
```java
private String driverId;
private String userId;
```

### Frontend Fixes

#### 6. Remove Driver "Complete Ride" Button
**Files to Fix:**
- `DriverDashboardSimple.jsx` (line 396)
- `DriverDashboard.jsx` (line 235)
- `CabDriverDashboard.jsx` (line 624)

Replace with:
```jsx
<button onClick={handleEndRide}>End Ride</button>
```

#### 7. Update User Payment Flow
**File:** `UserRidePage.jsx`

Current (line 103-120):
```jsx
// WRONG: Sets status to COMPLETED directly
fetch(`http://localhost:8077/api/bookings/${assignedCab.bookingId}/status?status=COMPLETED`)
```

Fix:
```jsx
// Step 1: Create payment order
const orderData = await fetch('http://localhost:8085/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({
        bookingId: assignedCab.bookingId,
        rideFare: assignedCab.fare,
        paymentMethod: 'razorpay'
    })
});

// Step 2: Open Razorpay
const rzp = new Razorpay({
    key: orderData.keyId,
    amount: orderData.amount,
    order_id: orderData.razorpayOrderId,
    handler: async (response) => {
        // Step 3: Verify payment
        await verifyPayment(response);
    }
});
rzp.open();
```

#### 8. Add Driver Notification Handler
**File:** `DriverDashboardSimple.jsx`

Add WebSocket listener:
```jsx
useEffect(() => {
    const stompClient = // ... connect to WebSocket
    stompClient.subscribe(`/topic/driver/${driverId}/payment`, (message) => {
        const data = JSON.parse(message.body);
        if (data.status === 'PAID') {
            showNotification('💰 Money Credited!');
        }
    });
}, []);
```

#### 9. Add User Feedback Form
**File:** `UserRidePage.jsx`

After payment success:
```jsx
{paymentSuccess && (
    <FeedbackForm 
        bookingId={assignedCab.bookingId}
        onSubmit={handleFeedbackSubmit}
    />
)}
```

#### 10. Add Redirects
- User: After feedback → Redirect to `/intro` or `/home`
- Driver: After payment notification → Redirect to `/driver/dashboard`

## 📋 Implementation Checklist

### Phase 2.1: Backend Status Flow
- [ ] Update `BookingStatus` enum
- [ ] Add `endRide` endpoint for driver
- [ ] Add validation in payment-service
- [ ] Add Kafka consumer in booking-service
- [ ] Update Kafka event payload
- [ ] Add WebSocket notification for driver

### Phase 2.2: Frontend Driver Fixes
- [ ] Remove "Complete Ride" button from all driver dashboards
- [ ] Add "End Ride" button (status: IN_PROGRESS → RIDE_ENDED)
- [ ] Add payment notification listener
- [ ] Add redirect after payment notification

### Phase 2.3: Frontend User Fixes
- [ ] Update "Complete Ride & Pay" button logic
- [ ] Integrate Razorpay payment flow
- [ ] Add payment verification
- [ ] Add feedback form after payment
- [ ] Add redirect to intro/home after feedback

### Phase 2.4: Testing
- [ ] Test driver can only end ride (not complete)
- [ ] Test user sees payment UI only after ride ended
- [ ] Test payment creates Kafka event
- [ ] Test driver receives "Money Credited" notification
- [ ] Test user feedback form appears
- [ ] Test redirects work correctly

## 🔄 Correct Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User books cab                                            │
│    Status: PENDING                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Driver accepts                                            │
│    Status: PENDING → DRIVER_ACCEPTED                         │
│    Notification: User notified                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Ride starts                                               │
│    Status: DRIVER_ACCEPTED → IN_PROGRESS                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Driver ends ride (DRIVER ACTION)                          │
│    Status: IN_PROGRESS → RIDE_ENDED                          │
│    Notification: User sees "Complete Ride & Pay" button      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. User clicks "Complete Ride & Pay" (USER ACTION)           │
│    Status: RIDE_ENDED → PAYMENT_PENDING                      │
│    Action: Open Razorpay UI                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Payment success                                           │
│    Status: PAYMENT_PENDING → PAID                            │
│    Kafka Event: ride.payment.completed                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Driver notified                                           │
│    WebSocket: "💰 Money Credited"                            │
│    Redirect: Driver Dashboard                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. User feedback                                             │
│    Show: Feedback form (user only)                           │
│    Submit: Feedback to backend                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Complete                                                  │
│    Status: PAID → COMPLETED                                  │
│    Redirect: User to /intro or /home                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚫 What NOT to Do

- ❌ Do NOT allow driver to trigger payment
- ❌ Do NOT allow driver to see payment UI
- ❌ Do NOT skip status validations
- ❌ Do NOT allow user to complete ride before driver ends it
- ❌ Do NOT add driver feedback
- ❌ Do NOT modify unrelated services (cab-service, user-service)

## 📁 Files to Modify

### Backend (booking-service)
1. `model/BookingStatus.java` - Update enum
2. `controller/BookingController.java` - Add endRide endpoint
3. `service/BookingService.java` - Add endRide logic
4. `kafka/PaymentCompletedConsumer.java` - NEW FILE
5. `kafka/PaymentCompletedEvent.java` - NEW FILE
6. `pom.xml` - Add Kafka dependencies (if missing)

### Backend (payment-service)
7. `service/PaymentService.java` - Add ride status validation
8. `kafka/event/RidePaymentCompletedEvent.java` - Add driverId, userId

### Frontend (UserProject)
9. `components/CabDriver/DriverDashboardSimple.jsx` - Remove complete button
10. `components/CabDriver/DriverDashboard.jsx` - Remove complete button
11. `components/CabDriver/CabDriverDashboard.jsx` - Remove complete button
12. `components/CabBooking/UserRidePage.jsx` - Add payment flow
13. `components/Feedback/FeedbackForm.jsx` - NEW FILE
14. Add Razorpay script to `index.html`

## 🎯 Success Criteria

After Phase 2 completion:

✅ Driver can only "End Ride" (not complete)
✅ User sees "Complete Ride & Pay" only after ride ended
✅ Payment UI opens with Razorpay
✅ Payment verification works
✅ Kafka event published after payment
✅ Driver receives "Money Credited" notification
✅ User feedback form appears
✅ User redirects to intro/home
✅ Driver redirects to dashboard
✅ No duplicate ride completion
✅ All status transitions validated

---

**Next Step:** Start implementing fixes in order listed above.
