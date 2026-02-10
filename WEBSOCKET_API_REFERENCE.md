# 🔌 WebSocket API Reference & Message Format

## Overview
Complete WebSocket API documentation for the enhanced Cab Booking System.

---

## Connection Setup

### Client-Side Connection
```javascript
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const socket = new SockJS('http://localhost:8077/ws');
const stompClient = Stomp.over(socket);

// Connect with user/driver ID
stompClient.connect({
  userId: 1,
  driverId: null  // null if user, filled if driver
}, 
  function(frame) {
    console.log('Connected: ' + frame.command);
    subscribeToTopics();
  },
  function(error) {
    console.log('Connection Error:', error);
  }
);
```

---

## Message Types & Endpoints

### 1️⃣ SEND RIDE REQUEST

**Who Sends**: User (after driver selection)  
**Endpoint**: `/app/ride-request/{driverId}`  
**Recipient Topic**: `/topic/driver/{driverId}/ride-request`

**Request Payload**:
```json
{
  "bookingId": 123,
  "driverId": 456,
  "userId": 1,
  "pickupLat": 28.6139,
  "pickupLng": 77.2090,
  "dropLat": 28.5244,
  "dropLng": 77.1855,
  "distance": 5.5,
  "fare": 105.50,
  "pickupAddress": "Delhi, India",
  "dropAddress": "Noida, India"
}
```

**Frontend Code**:
```javascript
stompClient.send(`/app/ride-request/${driverId}`, {}, JSON.stringify({
  bookingId: 123,
  driverId: 456,
  userId: user.id,
  pickupLat: userLocation.lat,
  pickupLng: userLocation.lng,
  dropLat: dropLocation.lat,
  dropLng: dropLocation.lng,
  distance: tripDistance,
  fare: estimatedFare
}));
```

---

### 2️⃣ DRIVER CONFIRMATION/REJECTION

**Who Sends**: Driver (after viewing request)  
**Endpoint**: `/app/driver-confirmation`  
**Backend Handler**: `RideRequestWebSocketController.handleDriverConfirmation()`

**Request Payload (ACCEPT)**:
```json
{
  "bookingId": 123,
  "driverId": 456,
  "status": "ACCEPTED",
  "reason": null,
  "timestamp": 1707123456789
}
```

**Request Payload (REJECT)**:
```json
{
  "bookingId": 123,
  "driverId": 456,
  "status": "REJECTED",
  "reason": "Too far away",
  "timestamp": 1707123456789
}
```

**Frontend Code (Driver App)**:
```javascript
// When driver clicks accept
stompClient.send('/app/driver-confirmation', {}, JSON.stringify({
  bookingId: 123,
  driverId: 456,
  status: 'ACCEPTED',
  reason: null
}));
```

---

### 3️⃣ RECEIVE RIDE CONFIRMATION

**Who Receives**: User  
**Topic**: `/topic/user/{userId}/confirmation`  
**Sent By**: Server (after driver accepts)

**Response Payload (ACCEPTED)**:
```json
{
  "status": "CONFIRMED",
  "booking": {
    "id": 123,
    "userId": 1,
    "cabId": 456,
    "pickupLocation": {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "type": "PICKUP"
    },
    "dropLocation": {
      "latitude": 28.5244,
      "longitude": 77.1855,
      "type": "DROP"
    },
    "distance": 5.5,
    "fare": 105.50,
    "status": "CONFIRMED",
    "bookingTime": "2026-02-10T15:30:00"
  },
  "message": "Driver accepted your ride!",
  "timestamp": 1707123456789
}
```

**Frontend Code (Subscribe)**:
```javascript
stompClient.subscribe(`/topic/user/${userId}/confirmation`, (message) => {
  const data = JSON.parse(message.body);
  console.log('Ride confirmed:', data);
  
  if (data.status === 'CONFIRMED') {
    // Update UI and navigate to ride page
    setShowWaitingUI(false);
    setAssignedCab({
      driverId: data.booking.cabId,
      bookingId: data.booking.id,
      distance: data.booking.distance,
      fare: data.booking.fare
    });
    setCurrentPage('user-ride');
  }
});
```

---

### 4️⃣ RECEIVE RIDE REJECTION

**Who Receives**: User  
**Topic**: `/topic/user/{userId}/rejection`  
**Sent By**: Server (after driver rejects)

**Response Payload**:
```json
{
  "status": "REJECTED",
  "bookingId": 123,
  "reason": "Too far away",
  "message": "Driver declined the ride request",
  "timestamp": 1707123456789
}
```

**Frontend Code (Subscribe)**:
```javascript
stompClient.subscribe(`/topic/user/${userId}/rejection`, (message) => {
  const data = JSON.parse(message.body);
  console.log('Ride rejected:', data.reason);
  
  setShowWaitingUI(false);
  setActiveRequest(null);
  setRequestStatus(`Driver declined: ${data.reason}`);
  setTimeRemaining(15);
});
```

---

### 5️⃣ ERROR HANDLING

**Who Receives**: User  
**Topic**: `/topic/user/{userId}/error`  
**Sent By**: Server (on error)

**Response Payload**:
```json
{
  "status": "ERROR",
  "message": "Could not process your request. Please try again.",
  "errorCode": "BOOKING_FAILED",
  "timestamp": 1707123456789
}
```

**Frontend Code (Subscribe)**:
```javascript
stompClient.subscribe(`/topic/user/${userId}/error`, (message) => {
  const data = JSON.parse(message.body);
  console.error('Error:', data.message);
  
  setShowWaitingUI(false);
  setError(data.message);
});
```

---

### 6️⃣ MESSAGES (Optional)

**Who Sends**: Driver or User  
**Endpoint**: `/app/driver-message/{userId}` (from driver to user)

**Request Payload**:
```json
{
  "from": "driver",
  "driverId": 456,
  "driverName": "John Doe",
  "text": "I'm running a bit late, will be there in 5 minutes",
  "timestamp": 1707123456789
}
```

**Frontend Code (Send)**:
```javascript
stompClient.send(`/app/driver-message/${userId}`, {}, JSON.stringify({
  from: 'driver',
  driverId: 456,
  text: "I'm on my way!"
}));
```

**Frontend Code (Receive)**:
```javascript
stompClient.subscribe(`/topic/user/${userId}/messages`, (message) => {
  const data = JSON.parse(message.body);
  console.log('Message from driver:', data.text);
  
  addMessageToChat({
    from: 'driver',
    name: data.driverName,
    text: data.text,
    timestamp: new Date(data.timestamp)
  });
});
```

---

## Complete Subscription Setup (User)

```javascript
function subscribeUserToTopics(userId) {
  // Confirmation topic
  stompClient.subscribe(`/topic/user/${userId}/confirmation`, (msg) => {
    const data = JSON.parse(msg.body);
    handleRideConfirmation(data);
  });
  
  // Rejection topic
  stompClient.subscribe(`/topic/user/${userId}/rejection`, (msg) => {
    const data = JSON.parse(msg.body);
    handleRideRejection(data);
  });
  
  // Error topic
  stompClient.subscribe(`/topic/user/${userId}/error`, (msg) => {
    const data = JSON.parse(msg.body);
    handleError(data);
  });
  
  // Messages topic
  stompClient.subscribe(`/topic/user/${userId}/messages`, (msg) => {
    const data = JSON.parse(msg.body);
    handleDriverMessage(data);
  });
}
```

---

## Complete Subscription Setup (Driver)

```javascript
function subscribeDriverToTopics(driverId) {
  // Ride requests topic
  stompClient.subscribe(`/topic/driver/${driverId}/ride-request`, (msg) => {
    const data = JSON.parse(msg.body);
    handleRideRequest(data);
    // Show notification to driver
    showRideRequestNotification(data);
  });
}
```

---

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| `ACCEPTED` | Driver accepted ride | Navigate to tracking page |
| `REJECTED` | Driver rejected ride | Show reason, allow retry |
| `ERROR` | Server error | Show error message, retry |
| `CONFIRMED` | Booking confirmed | Update UI with booking details |

---

## Error Responses

### Invalid Request
```json
{
  "status": "ERROR",
  "message": "Invalid booking ID",
  "errorCode": "INVALID_BOOKING",
  "timestamp": 1707123456789
}
```

### Booking Not Found
```json
{
  "status": "ERROR",
  "message": "Booking not found",
  "errorCode": "BOOKING_NOT_FOUND",
  "timestamp": 1707123456789
}
```

### Driver Offline
```json
{
  "status": "ERROR",
  "message": "Driver is offline",
  "errorCode": "DRIVER_OFFLINE",
  "timestamp": 1707123456789
}
```

---

## Timing & Constraints

| Constraint | Value |
|-----------|-------|
| Waiting Time | 15 seconds |
| Message Rate Limit | 1 per second (per user) |
| WebSocket Timeout | 30 seconds |
| Heartbeat Interval | 30 seconds |
| Max Request Distance | 10 km |
| Min Request Distance | 0.1 km |

---

## Testing WebSocket Locally

### Using wscat (CLI)
```bash
npm install -g wscat
wscat -c ws://localhost:8077/ws
```

### Sending a Test Message
```
> {"CONNECT": ["ACCEPT-VERSION:1.0,1.1,1.2"]}
> {"SEND": {"destination": "/app/driver-confirmation"}, "body": {...}}
```

---

## Backend Event Flow

```
Client sends → Server receives
                ↓
          Validates message
                ↓
          Updates database
                ↓
          Publishes to topic
                ↓
          All subscribers receive
                ↓
          Client-side handlers execute
```

---

## Important Notes

1. **JSON Parsing**: Always parse message.body as JSON
2. **Session Tracking**: Use WebSocketEventListener to verify connections
3. **Error Handling**: Implement retry logic for failed sends
4. **Timeout**: Set timeout for driver confirmation after 15 seconds
5. **Clean Disconnect**: Unsubscribe from topics when component unmounts

---

## Integration Checklist

- [ ] Import sockjs-client and stompjs
- [ ] Create WebSocket connection on app load
- [ ] Subscribe to user topics on login
- [ ] Subscribe to driver topics on driver login
- [ ] Handle connection errors gracefully
- [ ] Implement message timeout logic
- [ ] Add retry mechanism for failed sends
- [ ] Clean up subscriptions on logout
- [ ] Test with multiple concurrent users
- [ ] Monitor backend logs for errors

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Status**: ✅ Complete
