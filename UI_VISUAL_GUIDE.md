# 🎨 UI RESTRUCTURE - VISUAL GUIDE

## 📱 Application Overview

### Two Separate Applications

```
┌─────────────────────────────────────────────────────────────┐
│                    QUICKCAB SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │   👤 USER APP        │    │   🚗 DRIVER APP      │     │
│  │  (Blue/Purple)       │    │  (Green/Teal)        │     │
│  ├──────────────────────┤    ├──────────────────────┤     │
│  │ • Book Rides         │    │ • Accept Requests    │     │
│  │ • Track Rides        │    │ • Manage Rides       │     │
│  │ • View History       │    │ • View Earnings      │     │
│  │ • Make Payments      │    │ • Track Performance  │     │
│  │ • Rate Drivers       │    │ • Rate Passengers    │     │
│  └──────────────────────┘    └──────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 User App Design (Blue/Purple Theme)

### Color Palette
```
Primary:    #667eea ████████ (Vibrant Blue)
Secondary:  #764ba2 ████████ (Rich Purple)
Gradient:   ████████████████ (Blue → Purple)
Accent:     #f093fb ████████ (Light Pink)
Success:    #10b981 ████████ (Green)
```

### User App Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     USER HOME PAGE                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🏠 Welcome back, John!                              │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  📍 Where would you like to go?                │  │  │
│  │  │  [Book a Ride] ──────────────────────────────→ │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  Recent Rides:                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ 🚗 Economy • ₹250 • 5.2 km • 2 hours ago      │  │  │
│  │  │ From: Home → To: Office                        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Booking Flow (4 Steps)
```
Step 1: Pickup Location
┌─────────────────────────────────────┐
│  📍 Where are you?                  │
│  ┌───────────────────────────────┐ │
│  │ 🔍 Search or use current loc  │ │
│  └───────────────────────────────┘ │
│  📌 Current Location: Detected     │
│  [Use Current Location] [Next →]   │
└─────────────────────────────────────┘

Step 2: Drop Location
┌─────────────────────────────────────┐
│  🎯 Where to?                       │
│  ┌───────────────────────────────┐ │
│  │ 🔍 Search destination         │ │
│  └───────────────────────────────┘ │
│  Recent:                            │
│  • Home • Office • Airport          │
│  [← Back] [Next →]                  │
└─────────────────────────────────────┘

Step 3: Select Cab Type
┌─────────────────────────────────────┐
│  🚗 Choose your ride                │
│  ┌─────────────────────────────┐   │
│  │ 🚗 Economy    ₹50 + ₹10/km │   │
│  │ 4 seats • 5 min away       │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🚙 Premium    ₹100 + ₹15/km│   │
│  │ 4 seats • 3 min away       │   │
│  └─────────────────────────────┘   │
│  [← Back] [Confirm Booking →]      │
└─────────────────────────────────────┘

Step 4: Confirmation
┌─────────────────────────────────────┐
│  ✅ Booking Confirmed!              │
│  ┌───────────────────────────────┐ │
│  │ Driver: Raj Kumar             │ │
│  │ ⭐ 4.8 • 🚗 DL 01 AB 1234    │ │
│  │ ETA: 5 minutes                │ │
│  └───────────────────────────────┘ │
│  [Track Ride] [Call Driver]        │
└─────────────────────────────────────┘
```

---

## 🚗 Driver App Design (Green/Teal Theme)

### Color Palette
```
Primary:    #10b981 ████████ (Emerald Green)
Secondary:  #14b8a6 ████████ (Teal)
Gradient:   ████████████████ (Green → Teal)
Online:     #10b981 ████████ (Green)
Busy:       #f59e0b ████████ (Orange)
Offline:    #6b7280 ████████ (Gray)
```

### Driver Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                   DRIVER DASHBOARD                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👤 Raj Kumar                    Status: 🟢 Online   │  │
│  │  ⭐ 4.8 Rating • 1,234 Trips                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Today's Earnings:                                          │
│  ┌────────────┬────────────┬────────────┬────────────┐    │
│  │ 💰 Earned  │ 🚗 Trips   │ ⏱️ Hours   │ ⭐ Rating  │    │
│  │   ₹1,250   │     12     │    8.5     │    4.9     │    │
│  └────────────┴────────────┴────────────┴────────────┘    │
│                                                             │
│  Active Ride:                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👤 John Doe                                         │  │
│  │  📍 From: Connaught Place                            │  │
│  │  🎯 To: Indira Gandhi Airport                        │  │
│  │  💰 Estimated: ₹450 • 15.2 km                        │  │
│  │  [Navigate] [Call Customer] [Complete Ride]         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Ride Request Notification
```
┌─────────────────────────────────────┐
│  🔔 NEW RIDE REQUEST                │
│  ┌───────────────────────────────┐ │
│  │  👤 John Doe • ⭐ 4.7         │ │
│  │  📍 2.3 km away               │ │
│  │  💰 Estimated: ₹250           │ │
│  │                               │ │
│  │  From: Connaught Place        │ │
│  │  To: Nehru Place              │ │
│  │  Distance: 8.5 km             │ │
│  │                               │ │
│  │  ⏱️ Auto-reject in: 12s       │ │
│  │  ████████████░░░░░░░          │ │
│  │                               │ │
│  │  [✅ Accept] [❌ Reject]      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 📁 Component Structure

### User App Components
```
apps/user/
├── components/
│   ├── booking/
│   │   ├── BookingFlow.jsx          (Main booking wizard)
│   │   ├── LocationInput.jsx        (Location search)
│   │   ├── CabSelection.jsx         (Cab type picker)
│   │   └── BookingConfirmation.jsx  (Confirmation screen)
│   │
│   ├── ride/
│   │   ├── RideTracking.jsx         (Live tracking map)
│   │   ├── RideHistory.jsx          (Past rides list)
│   │   └── RideDetails.jsx          (Ride info card)
│   │
│   ├── profile/
│   │   ├── UserProfile.jsx          (Profile view)
│   │   └── ProfileSettings.jsx      (Settings form)
│   │
│   └── layout/
│       ├── UserNavigation.jsx       (Top nav bar)
│       ├── UserHeader.jsx           (Page header)
│       └── UserFooter.jsx           (Bottom nav)
│
└── pages/
    ├── HomePage.jsx                 (Dashboard)
    ├── BookingPage.jsx              (Booking flow)
    ├── RidesPage.jsx                (History)
    └── ProfilePage.jsx              (Profile)
```

### Driver App Components
```
apps/driver/
├── components/
│   ├── dashboard/
│   │   ├── DriverDashboard.jsx      (Main dashboard)
│   │   ├── StatsCard.jsx            (Earnings/stats)
│   │   └── EarningsChart.jsx        (Chart widget)
│   │
│   ├── requests/
│   │   ├── RideRequests.jsx         (Request list)
│   │   ├── RequestCard.jsx          (Single request)
│   │   └── RequestNotification.jsx  (Popup notification)
│   │
│   ├── active-ride/
│   │   ├── ActiveRide.jsx           (Current ride view)
│   │   ├── NavigationMap.jsx        (Map with route)
│   │   └── RideControls.jsx         (Start/Complete buttons)
│   │
│   ├── history/
│   │   ├── RideHistory.jsx          (Past rides)
│   │   └── HistoryCard.jsx          (Ride card)
│   │
│   └── layout/
│       ├── DriverNavigation.jsx     (Top nav)
│       ├── DriverHeader.jsx         (Header with status)
│       └── StatusToggle.jsx         (Online/Busy/Offline)
│
└── pages/
    ├── DashboardPage.jsx            (Main dashboard)
    ├── RequestsPage.jsx             (Requests)
    ├── ActiveRidePage.jsx           (Active ride)
    ├── HistoryPage.jsx              (History)
    └── ProfilePage.jsx              (Profile)
```

### Shared Components
```
shared/
├── components/
│   ├── auth/
│   │   ├── Login.jsx                (Login form)
│   │   ├── Register.jsx             (Register form)
│   │   └── AuthGuard.jsx            (Protected route)
│   │
│   ├── common/
│   │   ├── Button.jsx               (Reusable button)
│   │   ├── Input.jsx                (Form input)
│   │   ├── Card.jsx                 (Card container)
│   │   ├── Modal.jsx                (Modal dialog)
│   │   └── Loader.jsx               (Loading spinner)
│   │
│   └── map/
│       ├── MapView.jsx              (Google Maps)
│       └── LocationMarker.jsx       (Map marker)
│
├── hooks/
│   ├── useAuth.js                   (Authentication)
│   ├── useWebSocket.js              (WebSocket connection)
│   └── useApi.js                    (API calls)
│
├── services/
│   ├── api.js                       (API client)
│   ├── websocket.js                 (WebSocket client)
│   └── storage.js                   (LocalStorage)
│
└── utils/
    ├── distance.js                  (Distance calculations)
    ├── validation.js                (Form validation)
    └── formatters.js                (Data formatting)
```

---

## 🔄 Data Flow

### User Booking Flow
```
User Action → Component → Service → API → Backend
    ↓           ↓          ↓         ↓        ↓
  Click      BookingFlow  bookingService  POST  Booking
  "Book"     Component    .createBooking  /api  Service
                                              ↓
                                         Database
                                              ↓
                                         WebSocket
                                              ↓
                                         Driver App
```

### Driver Request Flow
```
Backend → WebSocket → Service → Hook → Component → UI
   ↓         ↓          ↓        ↓        ↓         ↓
Booking   Broadcast  wsService  useRide  Request  Notification
Created   Event      .onMessage Requests Card     Popup
```

---

## 🎯 Key Features

### User App Features
✅ **Smart Location Search**: OpenStreetMap integration
✅ **Multiple Cab Types**: Economy, Premium, Luxury, SUV
✅ **Real-time Tracking**: Live driver location
✅ **Price Estimation**: Instant fare calculation
✅ **Ride History**: View past rides
✅ **Multiple Payments**: Cash, Card, UPI, Wallet
✅ **Driver Rating**: Rate after each ride

### Driver App Features
✅ **Real-time Requests**: WebSocket notifications
✅ **Accept/Reject**: 15-second countdown
✅ **Earnings Dashboard**: Daily/weekly/monthly stats
✅ **Performance Metrics**: Rating, trips, hours
✅ **Navigation**: Integrated maps
✅ **Status Management**: Online/Busy/Offline toggle
✅ **Ride History**: Past trips and earnings

---

## 📱 Responsive Design

### Mobile (< 768px)
```
┌─────────────┐
│   Header    │
├─────────────┤
│             │
│   Content   │
│   (Single   │
│   Column)   │
│             │
├─────────────┤
│  Bottom Nav │
└─────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────────────────┐
│      Header         │
├──────┬──────────────┤
│ Side │              │
│ Nav  │   Content    │
│      │   (2 Cols)   │
│      │              │
└──────┴──────────────┘
```

### Desktop (> 1024px)
```
┌───────────────────────────┐
│         Header            │
├──────┬────────────────────┤
│      │                    │
│ Side │     Content        │
│ Nav  │   (Multi-column)   │
│      │                    │
└──────┴────────────────────┘
```

---

## 🎨 Animation Examples

### Button Hover
```css
.button {
  transition: all 0.3s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
```

### Card Entrance
```css
@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.card {
  animation: slideInUp 0.3s ease-out;
}
```

### Loading Spinner
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loader {
  animation: spin 1s linear infinite;
}
```

---

**This visual guide provides a complete overview of the restructured UI system!** 🎉
