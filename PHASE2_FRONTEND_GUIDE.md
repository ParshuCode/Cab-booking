# Phase 2: Frontend Fixes - Implementation Guide

## Overview
This document outlines all frontend changes needed to implement the correct ride completion and payment flow.

---

## Phase 2.2: Driver UI Fixes

### Files to Modify:

1. **DriverDashboardSimple.jsx** (PRIMARY)
2. **DriverDashboard.jsx** (if used)
3. **CabDriverDashboard.jsx** (if used)

### Changes Required:

#### 1. Remove "Complete Ride" Button
**Current (WRONG):**
```jsx
<button className="btn-complete" onClick={handleCompleteRide}>
  ✅ Complete Ride
</button>
```

**Replace With:**
```jsx
{!rideStarted ? (
  <button className="btn-start" onClick={handleStartRide}>
    🚀 Start Ride
  </button>
) : (
  <button className="btn-end" onClick={handleEndRide}>
    🏁 End Ride
  </button>
)}
```

#### 2. Add Ride State Management
```jsx
const [rideStarted, setRideStarted] = useState(false);
const [paymentNotification, setPaymentNotification] = useState(null);
```

#### 3. Implement handleStartRide
```jsx
const handleStartRide = async () => {
  try {
    const response = await fetch(
      `http://localhost:8077/api/bookings/${acceptedRide.id}/start-ride?driverId=${cab.id}`,
      { method: 'PUT' }
    );
    
    if (response.ok) {
      setRideStarted(true);
      console.log('✅ Ride started');
    }
  } catch (error) {
    console.error('Failed to start ride:', error);
  }
};
```

#### 4. Implement handleEndRide
```jsx
const handleEndRide = async () => {
  try {
    const response = await fetch(
      `http://localhost:8077/api/bookings/${acceptedRide.id}/end-ride?driverId=${cab.id}`,
      { method: 'PUT' }
    );
    
    if (response.ok) {
      console.log('✅ Ride ended. Waiting for user payment...');
      // Don't clear acceptedRide yet - wait for payment notification
    }
  } catch (error) {
    console.error('Failed to end ride:', error);
  }
};
```

#### 5. Add WebSocket Listener for Payment Notifications
```jsx
useEffect(() => {
  if (!cab?.id) return;
  
  // Connect to WebSocket for payment notifications
  const socket = new SockJS('http://localhost:8077/ws');
  const stompClient = Stomp.over(socket);
  
  stompClient.connect({}, () => {
    // Subscribe to payment credited notifications
    stompClient.subscribe(`/topic/driver/${cab.id}/payment-credited`, (message) => {
      const data = JSON.parse(message.body);
      console.log('💰 Payment received:', data);
      
      setPaymentNotification(data);
      
      // Show notification for 5 seconds
      setTimeout(() => {
        setPaymentNotification(null);
        handleCompleteRide(); // Now we can complete
      }, 5000);
    });
  });
  
  return () => {
    if (stompClient) stompClient.disconnect();
  };
}, [cab]);
```

#### 6. Add Payment Notification UI
```jsx
{paymentNotification && (
  <div className="payment-notification">
    <div className="notification-icon">💰</div>
    <div className="notification-content">
      <h3>Money Credited!</h3>
      <p>₹{paymentNotification.amount} has been added to your account</p>
    </div>
  </div>
)}
```

---

## Phase 2.3: User UI Fixes

### Files to Modify:

1. **UserRidePage.jsx** (PRIMARY)
2. **index.html** (Add Razorpay script)

### Changes Required:

#### 1. Add Razorpay Script to index.html
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

#### 2. Update State Management in UserRidePage.jsx
```jsx
const [rideStatus, setRideStatus] = useState('awaiting'); // awaiting, assigned, in_progress, ended, payment_pending, paid
const [showPaymentUI, setShowPaymentUI] = useState(false);
const [showFeedback, setShowFeedback] = useState(false);
```

#### 3. Add WebSocket Listener for Ride Status
```jsx
useEffect(() => {
  if (!assignedCab?.bookingId) return;
  
  const socket = new SockJS('http://localhost:8077/ws');
  const stompClient = Stomp.over(socket);
  
  stompClient.connect({}, () => {
    // Listen for ride started
    stompClient.subscribe(`/topic/user/${userId}/ride-status`, (message) => {
      console.log('Ride status:', message.body);
      setRideStatus('in_progress');
    });
    
    // Listen for ride ended
    stompClient.subscribe(`/topic/user/${userId}/ride-ended`, (message) => {
      const data = JSON.parse(message.body);
      console.log('Ride ended:', data);
      setRideStatus('ended');
      setShowPaymentUI(true);
    });
    
    // Listen for payment success
    stompClient.subscribe(`/topic/user/${userId}/payment-success`, (message) => {
      console.log('Payment successful');
      setRideStatus('paid');
      setShowPaymentUI(false);
      setShowFeedback(true);
    });
  });
  
  return () => {
    if (stompClient) stompClient.disconnect();
  };
}, [assignedCab, userId]);
```

#### 4. Update "Complete Ride & Pay" Button Logic
**Current (WRONG):**
```jsx
const handleCompleteRide = async () => {
  // Sets status to COMPLETED directly - WRONG!
  fetch(`http://localhost:8077/api/bookings/${assignedCab.bookingId}/status?status=COMPLETED`)
};
```

**Replace With:**
```jsx
const handleCompleteRideAndPay = async () => {
  try {
    // Step 1: Initiate payment status
    await fetch(
      `http://localhost:8077/api/bookings/${assignedCab.bookingId}/initiate-payment?userId=${userId}`,
      { method: 'PUT' }
    );
    
    // Step 2: Create payment order
    const orderResponse = await fetch('http://localhost:8085/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: String(assignedCab.bookingId),
        rideFare: assignedCab.fare || 500,
        paymentMethod: 'razorpay',
        customerName: 'User Name'
      })
    });
    
    const orderData = await orderResponse.json();
    
    // Step 3: Open Razorpay
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.razorpayOrderId,
      name: 'Cab Booking',
      description: `Payment for Booking ${assignedCab.bookingId}`,
      handler: async (response) => {
        // Step 4: Verify payment
        await verifyPayment(response);
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com'
      },
      theme: {
        color: '#3399cc'
      }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
    
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
};
```

#### 5. Implement Payment Verification
```jsx
const verifyPayment = async (razorpayResponse) => {
  try {
    const response = await fetch('http://localhost:8085/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: String(assignedCab.bookingId),
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature
      })
    });
    
    const result = await response.json();
    
    if (result.verified) {
      console.log('✅ Payment verified successfully');
      // WebSocket will notify us to show feedback
    } else {
      console.error('❌ Payment verification failed');
      alert('Payment verification failed. Please contact support.');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
  }
};
```

#### 6. Update UI Rendering
```jsx
return (
  <div className="user-ride-page">
    {rideStatus === 'awaiting' && (
      <div>Waiting for driver...</div>
    )}
    
    {rideStatus === 'assigned' && (
      <div>Driver assigned! Arriving soon...</div>
    )}
    
    {rideStatus === 'in_progress' && (
      <div>Ride in progress...</div>
    )}
    
    {rideStatus === 'ended' && showPaymentUI && (
      <div className="payment-section">
        <h2>Ride Completed!</h2>
        <p>Total Fare: ₹{assignedCab.fare}</p>
        <button 
          className="btn-pay" 
          onClick={handleCompleteRideAndPay}
        >
          💳 Complete Ride & Pay
        </button>
      </div>
    )}
    
    {showFeedback && (
      <FeedbackForm 
        bookingId={assignedCab.bookingId}
        onSubmit={handleFeedbackSubmit}
      />
    )}
  </div>
);
```

#### 7. Create Feedback Form Component
```jsx
const FeedbackForm = ({ bookingId, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const handleSubmit = async () => {
    await fetch('http://localhost:8077/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      })
    });
    
    onSubmit();
  };
  
  return (
    <div className="feedback-form">
      <h3>Rate Your Ride</h3>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star}
            onClick={() => setRating(star)}
            className={star <= rating ? 'star-filled' : 'star-empty'}
          >
            ⭐
          </span>
        ))}
      </div>
      <textarea
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit Feedback</button>
    </div>
  );
};
```

#### 8. Handle Feedback Submission
```jsx
const handleFeedbackSubmit = () => {
  setShowFeedback(false);
  
  // Redirect to home/intro
  navigate('/intro'); // or navigate('/home')
};
```

---

## Summary of Changes

### Driver Side:
- ✅ Remove "Complete Ride" button
- ✅ Add "Start Ride" button
- ✅ Add "End Ride" button
- ✅ Add WebSocket listener for payment notifications
- ✅ Show "Money Credited" notification
- ✅ Redirect to dashboard after payment

### User Side:
- ✅ Add Razorpay script
- ✅ Add WebSocket listener for ride status
- ✅ Update "Complete Ride & Pay" button logic
- ✅ Integrate Razorpay payment flow
- ✅ Add payment verification
- ✅ Add feedback form
- ✅ Redirect to intro/home after feedback

---

## Testing Checklist

- [ ] Driver can start ride
- [ ] Driver can end ride
- [ ] Driver cannot complete ride
- [ ] User sees payment button only after ride ended
- [ ] Razorpay opens correctly
- [ ] Payment verification works
- [ ] Kafka event is published
- [ ] Driver receives payment notification
- [ ] User sees feedback form
- [ ] Feedback submission works
- [ ] User redirects to intro/home
- [ ] Driver redirects to dashboard

---

**Next Step:** Implement these changes in the actual files
