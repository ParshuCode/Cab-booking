# System File Checklist - GPS Location & Driver Matching

## ✅ FRONTEND FILES (React)

### Location Request System
- **LocationRequest.jsx** ✓
  - Location: `src/components/CabBooking/LocationRequest.jsx`
  - Features: GPS request, manual entry, validation
  - Returns: `{lat, lng, source}`

- **LocationRequest.css** ✓
  - Location: `src/components/CabBooking/LocationRequest.css`
  - Styles: Full-screen layout, spinner, form styling

### Booking Flow Integration
- **BookCabPage.jsx** ✓ (UPDATED)
  - Location: `src/components/CabBooking/BookCabPage.jsx`
  - Step 1: Shows LocationRequest until location confirmed
  - Step 2: Shows DriverListingPage with confirmed coordinates
  - Imports: LocationRequest component

- **DriverListingPage.jsx** ✓
  - Location: `src/components/CabBooking/DriverListingPage.jsx`
  - Receives: `userLocation` with `{lat, lng}`
  - API Call: `GET /api/cabs/nearby?latitude={lat}&longitude={lng}&radiusKm=5`
  - Sorting: Haversine distance (client-side)
  - Selection: Calls booking endpoints with coordinates

- **DriverListingPage.css** ✓
  - Location: `src/components/CabBooking/DriverListingPage.css`
  - Contains: All styling for driver cards, timer, messages

### Navigation & Routing
- **App.jsx** ✓ (UPDATED)
  - Location: `src/App.jsx`
  - New Feature: Role selection screen
  - State: `[userRole, setUserRole]` - tracks 'passenger' or 'driver'
  - Flow: Shows RoleSelection if `!userRole`
  - Props: Passes `userRole` to Navigation

- **Navigation.jsx** ✓ (UPDATED)
  - Location: `src/components/Navigation/Navigation.jsx`
  - Role-based menu: Shows different options per role
  - Passenger menu: Home, Book Cab, My Bookings, Profile
  - Driver menu: Home, Driver Login, Register as Driver, Dashboard

- **RoleSelection.jsx** ✓
  - Location: `src/components/RoleSelection/RoleSelection.jsx`
  - Features: Two-card UI (Passenger/Driver), animation

- **RoleSelection.css** ✓
  - Location: `src/components/RoleSelection/RoleSelection.css`
  - Styles: Gradient background, bouncing icons, responsive

---

## ✅ BACKEND FILES - CAB SERVICE (Port 8076)

### Models
- **Cab.java** ✓
  - Location: `src/main/java/com/cabbooking/cabservice/model/Cab.java`
  - Fields: `currentLocation` (Location type)
  - Status: AVAILABLE, OFFLINE, BUSY
  - Used by: Driver search, location tracking

- **Location.java** ✓
  - Location: `src/main/java/com/cabbooking/cabservice/model/Location.java`
  - Fields: 
    - `latitude` (Double)
    - `longitude` (Double)
    - `address` (String, optional)
    - `type` (PICKUP, DROP, CAB_LOCATION)

### Controllers
- **CabController.java** ✓ (UPDATED)
  - Location: `src/main/java/com/cabbooking/cabservice/controller/CabController.java`
  
  **Endpoint 1**: `GET /api/cabs/nearby` (Line 130)
  - Parameters: latitude, longitude, radiusKm
  - Returns: List of nearby AVAILABLE cabs
  
  **Endpoint 2**: `GET /api/cabs/login` (Line 146) ✨ UPDATED
  - Parameters: cabNumber, driverPhone
  - Action: Sets status to AVAILABLE
  - Returns: Updated cab
  
  **Endpoint 3**: `PUT /api/cabs/{cabId}/location` (Line 123)
  - Body: `{latitude, longitude}`
  - Action: Updates driver's current location
  - Used by: Real-time location tracking

### Services
- **CabService.java** ✓
  - Location: `src/main/java/com/cabbooking/cabservice/service/CabService.java`
  
  **Method**: `findAvailableCabsNear()` (Line 99)
  - Filters: `status === AVAILABLE`
  - Calculates: Haversine distance
  - Returns: All cabs within radius, unsorted
  
  **Method**: `haversine()` (Line 111)
  - Algorithm: Haversine formula
  - Radius: 6371 km (Earth)
  - Returns: Distance in km
  
  **Method**: `updateLocation()` (Line 102)
  - Updates: Driver's currentLocation
  - Called by: PUT /api/cabs/{cabId}/location endpoint

### DTOs
- **LocationUpdateRequest.java** ✓
  - Location: `src/main/java/com/cabbooking/cabservice/dto/LocationUpdateRequest.java`
  - Fields: latitude, longitude
  - Used by: Location update endpoint

---

## ✅ BACKEND FILES - BOOKING SERVICE (Port 8077)

### Models
- **Booking.java** ✓
  - Location: `src/main/java/com/cabbooking/bookingservice/model/Booking.java`
  - Fields:
    - `pickupLocation` (Location type)
    - `dropLocation` (Location type)
    - `status` (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED)
  - Stores: Full coordinates with latitude/longitude

- **Location.java** ✓
  - Location: `src/main/java/com/cabbooking/bookingservice/model/Location.java`
  - Shared model with booking data
  - Fields: latitude, longitude, address, type

### Controllers
- **BookingController.java** ✓
  - Location: `src/main/java/com/cabbooking/bookingservice/controller/BookingController.java`
  
  **Endpoint 1**: `POST /api/bookings` (Line 77)
  - Body: `{userId, cabId, pickupLocation: "lat,lng", dropLocation: "lat,lng"}`
  - Returns: Created booking with ID
  
  **Endpoint 2**: `POST /api/bookings/{bookingId}/accept-by-driver/{cabId}` (Line 140) ✨ NEW
  - Action: Sets booking status to CONFIRMED
  - Notifies: Cab service

### Services
- **BookingService.java** ✓
  - Location: `src/main/java/com/cabbooking/bookingservice/service/BookingService.java`
  
  **Method**: `createBooking()` (Line 83)
  - Parses: "lat,lng" format into Location objects
  - Calculates: Distance via DistanceCalculationService
  - Creates: Booking with PENDING status
  - Returns: Booking with ID
  
  **Method**: `parseLocationString()` (Line 69)
  - Input: "28.6139,77.2090"
  - Splits by comma
  - Converts: String → Double (latitude, longitude)
  - Creates: Location object with type
  
  **Method**: `acceptRideByDriver()` (Line 125)
  - Updates: Booking status to CONFIRMED
  - Notifies: Cab service at `/api/cabs/{cabId}/accept-ride`
  - Called by: POST /api/bookings/{bookingId}/accept-by-driver/{cabId}

- **DistanceCalculationService.java** ✓
  - Location: `src/main/java/.../service/DistanceCalculationService.java`
  - Method: `calculateDistance()`
  - Input: Two Location objects
  - Uses: Haversine formula
  - Returns: Distance in km

### DTOs
- **BookingRequest.java** ✓
  - Location: `src/main/java/com/cabbooking/bookingservice/dto/BookingRequest.java`
  - Fields:
    - userId (Long)
    - cabId (Long)
    - pickupLocation (String) - "lat,lng" format
    - dropLocation (String) - "lat,lng" format

---

## 📋 DATA FLOW VERIFICATION

### 1. User Gets Location
```
User clicks "Book Cab"
  ↓
LocationRequest component
  ↓
Browser requests GPS permission
  ↓
GPS returns: {latitude: 28.6139, longitude: 77.2090}
  ↓
onLocationReceived({lat: 28.6139, lng: 77.2090, source: "gps"})
  ↓
setPickupLocation() in BookCabPage
  ↓
locationConfirmed = true
```

### 2. Frontend Searches Drivers
```
DriverListingPage receives userLocation: {lat, lng}
  ↓
useEffect triggers on userLocation change
  ↓
fetch("/api/cabs/nearby?latitude=28.6139&longitude=77.2090&radiusKm=5")
  ↓
Cab Service Backend:
  • Loads all cabs
  • Filters: status === "AVAILABLE"
  • For each cab, calculates haversine distance
  • Returns cabs within 5km
  ↓
Frontend receives cab list
  ↓
Frontend calculates distance again (client-side verification)
  ↓
Frontend sorts by distance
  ↓
Displays top 5 drivers
```

### 3. User Selects Driver
```
handleDriverAccept(driver)
  ↓
POST /api/bookings {
  userId: 1,
  cabId: driver.id,
  pickupLocation: "28.6139,77.2090",
  dropLocation: "28.5244,77.1855"
}
  ↓
Booking Service Backend:
  • Parses "28.6139,77.2090" → lat=28.6139, lng=77.2090
  • Creates Location(lat, lng, PICKUP)
  • Parses "28.5244,77.1855" → lat=28.5244, lng=77.1855
  • Creates Location(lat, lng, DROP)
  • Calculates distance: ~9 km
  • Creates Booking(user, cab, pickupLoc, dropLoc, distance)
  • Status: PENDING
  • Saves to database
  • Returns booking.id
  ↓
POST /api/bookings/{bookingId}/accept-by-driver/{cabId}
  ↓
Updates Booking status: PENDING → CONFIRMED
  ↓
Notifies cab-service
  ↓
Frontend navigates to user-ride page
```

---

## 🔍 CRITICAL INTEGRATION POINTS

### 1. Location Format Consistency
- ✅ Frontend sends: "lat,lng" string
- ✅ Backend receives: String
- ✅ Backend parses: Split by comma, convert to Double
- ✅ Backend stores: Two separate Double fields (latitude, longitude)
- ✅ Database stores: latitude and longitude

### 2. Distance Calculation (Both Sides)
- ✅ Backend calculates: In CabService.findAvailableCabsNear()
- ✅ Frontend calculates: In DriverListingPage (client-side sort)
- ✅ Booking Service calculates: In createBooking() for storage

### 3. Driver Availability
- ✅ Default: status = OFFLINE or null after registration
- ✅ After login: status = AVAILABLE ✨ NEW LOGIC
- ✅ Frontend filter: Only shows cabs with status === "AVAILABLE"
- ✅ Backend filter: Only returns cabs with CabStatus.AVAILABLE

### 4. Booking Creation
- ✅ Requires: userId, cabId, pickupLocation, dropLocation
- ✅ Location format: "latitude,longitude" (comma-separated string)
- ✅ Creates: Location entities, calculates distance, saves booking
- ✅ Returns: Booking with ID, status=PENDING

### 5. Driver Acceptance
- ✅ Endpoint: POST /api/bookings/{bookingId}/accept-by-driver/{cabId}
- ✅ Updates: Booking status to CONFIRMED
- ✅ Notifies: Cab service (POST /api/cabs/{cabId}/accept-ride)
- ✅ Frontend: Navigates to ride tracking page

---

## 📊 DATABASE SCHEMA

### Locations Table
```
id | latitude | longitude | address | type | created_at
1  | 28.6139  | 77.2090   | NULL    | PICKUP | 2026-02-10
2  | 28.5244  | 77.1855   | NULL    | DROP   | 2026-02-10
```

### Cabs Table (with new fields)
```
id | cab_number | driver_name | driver_phone | current_location_id | status | cab_type
1  | DL01AB1234 | John Doe    | 9999999999   | 1                   | AVAILABLE | MINI
```

### Bookings Table (with coordinate storage)
```
id | user_id | cab_id | pickup_location_id | drop_location_id | distance | status | created_at
1  | 1       | 1      | 1                  | 2                | 9.0      | PENDING | 2026-02-10
```

---

## ✅ SYSTEM READY FOR TESTING

All files are in place and properly integrated. The system:
1. ✅ Requests user's GPS location
2. ✅ Stores latitude and longitude separately
3. ✅ Searches for available drivers within 5km radius
4. ✅ Calculates distances using Haversine formula
5. ✅ Displays drivers sorted by distance
6. ✅ Creates bookings with stored coordinates
7. ✅ Processes driver acceptance
8. ✅ Separates user and driver interfaces

**Status**: COMPLETE & READY TO RUN ✨
