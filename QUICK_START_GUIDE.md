# 🚀 QUICK START GUIDE - GPS Booking System

## 1️⃣ START SERVICES (In Order)

### Terminal 1: Eureka Server
```bash
cd c:\Cab\ Booking\ System\service
mvn spring-boot:run
# Wait for: "Started EurekaServer in X seconds"
# Dashboard: http://localhost:8761
```

### Terminal 2: Cab Service
```bash
cd c:\Cab\ Booking\ System\cab-service
mvn spring-boot:run
# Port: 8076
# Should appear in Eureka dashboard
```

### Terminal 3: Booking Service
```bash
cd c:\Cab\ Booking\ System\booking-service
mvn spring-boot:run
# Port: 8077
# Should appear in Eureka dashboard
```

### Terminal 4: User Service
```bash
cd c:\Cab\ Booking\ System\user-service
mvn spring-boot:run
# Port: 8075
# Should appear in Eureka dashboard
```

### Terminal 5: React Frontend
```bash
cd c:\Cab\ Booking\ System\UserProject
npm run dev
# Vite server: http://localhost:5173
```

---

## 2️⃣ TEST WORKFLOW

### Step 1: Register Driver
1. Open http://localhost:5173
2. Click "Continue as Driver"
3. Click "Register as Driver"
4. Fill form:
   - Driver Name: John Doe
   - Phone: 9999999999
   - Cab Number: DL01AB1234
   - Cab Model: Toyota Etios
   - Color: White
   - Capacity: 4
   - Base Fare: 50
   - Per KM Rate: 10
   - Cab Type: MINI
5. Submit
6. **Important**: Driver is registered but NOT searchable yet

### Step 2: Update Driver Location (via curl)
Open PowerShell and run:
```bash
curl -X PUT "http://localhost:8076/api/cabs/1/location" `
  -H "Content-Type: application/json" `
  -d '{"latitude": 28.6200, "longitude": 77.2050}'
```
**Result**: Driver's location updated to coordinates ~1km away from user

### Step 3: Driver Login
1. Back in app, click "Driver Login"
2. Enter:
   - Cab Number: DL01AB1234
   - Phone: 9999999999
3. Click Login
4. **Important**: Status automatically set to AVAILABLE ✅

### Step 4: Register User
1. Open new browser tab or incognito window
2. Click "Continue as Passenger"
3. Click "Sign Up"
4. Fill form:
   - Name: Jane Smith
   - Email: jane@example.com
   - Password: password123
5. Submit

### Step 5: User Books Cab
1. Click "Book Cab"
2. **LocationRequest screen appears**:
   - Browser asks: "Allow location access?"
   - Click "Allow"
3. If GPS blocked:
   - Click "Enter Location Manually"
   - Latitude: 28.6139
   - Longitude: 77.2090
   - Click "Confirm Location"
4. **DriverListingPage shows**:
   - John Doe should appear in list (1km away)
   - Distance: ~0.7 km
   - Cab: DL01AB1234 (MINI)

### Step 6: Select Driver
1. Click on "John Doe" card
2. **Drop Location popup** appears
3. Enter drop location or use current
4. Click "Request Driver"
5. 15-second countdown starts

### Step 7: Driver Accepts
1. Backend creates booking automatically
2. Status becomes CONFIRMED
3. Frontend navigates to "Ride Tracking" page
4. Displays driver info and live tracking

---

## 3️⃣ API ENDPOINTS REFERENCE

### Cab Service (Port 8076)

**Find Nearby Drivers**
```bash
curl "http://localhost:8076/api/cabs/nearby?latitude=28.6139&longitude=77.2090&radiusKm=5"
```
Response: List of available cabs within 5km

**Driver Login**
```bash
curl "http://localhost:8076/api/cabs/login?cabNumber=DL01AB1234&driverPhone=9999999999"
```
Response: Updated cab with status=AVAILABLE

**Update Driver Location**
```bash
curl -X PUT http://localhost:8076/api/cabs/1/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 28.6200, "longitude": 77.2050}'
```

---

### Booking Service (Port 8077)

**Create Booking**
```bash
curl -X POST http://localhost:8077/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "cabId": 1,
    "pickupLocation": "28.6139,77.2090",
    "dropLocation": "28.5244,77.1855"
  }'
```
Response: `{"id": 1, "status": "PENDING", ...}`

**Accept Booking by Driver**
```bash
curl -X POST "http://localhost:8077/api/bookings/1/accept-by-driver/1"
```
Response: Updated booking with status=CONFIRMED

---

## 4️⃣ VERIFICATION CHECKLIST

- [ ] All 4 services running (Eureka, Cab, Booking, User)
- [ ] React app loaded at http://localhost:5173
- [ ] Role selection screen displayed
- [ ] Passenger/Driver roles work separately
- [ ] Driver registered and set to AVAILABLE after login
- [ ] LocationRequest asks for GPS permission
- [ ] Driver appears in nearby drivers list
- [ ] Distance calculated correctly (~0.7 km in test)
- [ ] Booking created with coordinates stored
- [ ] Status changes to CONFIRMED after acceptance
- [ ] User navigates to ride tracking page

---

## 5️⃣ TROUBLESHOOTING

### GPS Not Working?
- Check browser permissions: Settings → Privacy → Site Settings → Location
- Try manual entry instead
- Ensure HTTPS/localhost works with geolocation

### Drivers Not Showing?
- ✅ Driver must be registered
- ✅ Driver must be logged in (status=AVAILABLE)
- ✅ Driver must have currentLocation set
- ✅ Distance must be ≤ 5km from user

### Distance Wrong?
- Check both Haversine calculations (backend and frontend)
- Verify coordinates are within valid ranges (Lat: -90/90, Lng: -180/180)

### Booking Creation Fails?
- Verify format: "latitude,longitude" (comma, no spaces)
- Check both userId and cabId exist in database
- Check booking service is running (port 8077)

### Driver Login Fails?
- Verify cabNumber and driverPhone match registration
- Check cab service is running (port 8076)
- Verify driver was registered with exact phone

---

## 6️⃣ KEY FILES TO MONITOR

### Frontend Logs
- Browser console (F12)
- Check for API call errors
- Verify location object structure

### Backend Logs
```bash
# Look for:
"GET /api/cabs/nearby?latitude=28.6139..."
"POST /api/bookings"
"POST /api/bookings/1/accept-by-driver/1"
"📍 Location obtained: Lat=28.6139, Lng=77.2090"
```

---

## 7️⃣ DATABASE INSPECTION

### View All Cabs
```
SELECT id, cab_number, driver_name, status FROM cabs;
```

### View All Bookings
```
SELECT id, user_id, cab_id, status, created_at FROM bookings;
```

### View Driver Location
```
SELECT id, latitude, longitude FROM locations WHERE id = 1;
```

---

## 🎯 SUCCESS INDICATORS

✅ **System Working Perfectly When:**
1. GPS location requested on booking
2. Nearby drivers shown in list
3. Distance shown for each driver
4. Drivers sorted by distance (nearest first)
5. Booking created with coordinates
6. Status changes to CONFIRMED
7. User navigates to tracking page

---

**🚀 System Status: READY TO LAUNCH** ✨
