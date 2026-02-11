import React, { useEffect, useState } from "react";
import "./DriverListingPage.css";
import DestinationInput from "./DestinationInput";
import WaitingForDriverUI from "./WaitingForDriverUI";

const DriverListingPage = ({
  user,
  userLocation,
  setCurrentPage,
  setPickupLocation,
  setDropLocation,
  setAssignedCab
}) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [dropLocation, setDropLoc] = useState(null);
  const [tripDistance, setTripDistance] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [requestStatus, setRequestStatus] = useState("");
  const [cabType, setCabType] = useState("ALL");
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [showWaitingUI, setShowWaitingUI] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch available drivers from backend
  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [userLocation]);

  const fetchDrivers = () => {
    setLoadingDrivers(true);
    // Use the NEW endpoint for available drivers
    fetch("http://localhost:8076/api/cabs/drivers/available")
      .then(res => res.json())
      .then(data => {
        // Calculate distance for each driver
        const driversWithDist = data.map(driver => {
          let dist = 999;
          if (userLocation && driver.currentLocation) {
            dist = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              driver.currentLocation.latitude,
              driver.currentLocation.longitude
            );
          }
          return { ...driver, distanceFromUser: dist };
        });

        // Sort by distance
        const sorted = driversWithDist.sort((a, b) => a.distanceFromUser - b.distanceFromUser);
        setDrivers(sorted);
        setErrorMsg("");
      })
      .catch(err => {
        console.error("Error fetching drivers:", err);
        setErrorMsg("Failed to load drivers. Retrying...");
      })
      .finally(() => setLoadingDrivers(false));
  };

  // 15-second countdown timer for request
  useEffect(() => {
    if (activeRequest && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeRequest && timeRemaining === 0) {
      setRequestStatus("Driver unavailable. Please try another.");
      setActiveRequest(null);
      setShowWaitingUI(false);
      setTimeRemaining(15);
    }
  }, [activeRequest, timeRemaining]);

  // Haversine Distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateFare = (distance, type) => {
    const baseFare = type === 'LUXURY' ? 100 : type === 'SUV' ? 80 : 50;
    const perKmRate = type === 'LUXURY' ? 20 : type === 'SUV' ? 15 : 10;
    return baseFare + (distance * perKmRate);
  };

  const handleDestinationSet = (destination) => {
    setDropLoc(destination);
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      destination.lat,
      destination.lng
    );
    setTripDistance(dist);
    // Default fare estimation (Standard)
    setEstimatedFare(calculateFare(dist, "MINI"));
  };

  const handleSendRequest = async (driver) => {
    if (!dropLocation) {
      alert("Please enter drop location first");
      return;
    }

    setSelectedDriver(driver);
    setActiveRequest(driver);

    // Recalculate fare based on selected cab type
    const finalFare = calculateFare(tripDistance, driver.cabType);
    setEstimatedFare(finalFare);

    setTimeRemaining(15);
    setShowWaitingUI(true);
    setRequestStatus(`Contacting ${driver.driverName}...`);
  };

  // Logic when Driver Accepts (Simulated or Real)
  const handleDriverAccept = async (driver) => {
    setShowWaitingUI(false);
    setRequestStatus("🎉 Driver found! Confirming...");

    try {
      // 1. Create Booking
      const headers = { "Content-Type": "application/json" };
      // Add token if user has one
      if (user && user.token) headers["Authorization"] = `Bearer ${user.token}`;

      const bookingRes = await fetch("http://localhost:8077/api/bookings", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          userId: user?.id || 1, // Fallback if no user
          cabId: driver.id,
          pickupLocation: `${userLocation.lat},${userLocation.lng}`,
          dropLocation: `${dropLocation.lat},${dropLocation.lng}`
        })
      });

      if (!bookingRes.ok) throw new Error("Failed to create booking");
      const booking = await bookingRes.json();

      // 2. Accept Booking (Simulating Driver Side for now to ensure flow works)
      const acceptRes = await fetch(
        `http://localhost:8077/api/bookings/${booking.id}/accept-by-driver/${driver.id}`,
        { method: "POST" }
      );

      if (!acceptRes.ok) throw new Error("Failed to assign driver");

      // 3. Set State & Redirect
      setAssignedCab({
        ...driver,
        bookingId: booking.id,
        tripDistance: tripDistance,
        estimatedFare: estimatedFare,
        pickupLocation: "Current Location", // Simplified
        dropLocation: dropLocation.description || "Selected Destination"
      });

      setPickupLocation(userLocation);
      setDropLocation(dropLocation);

      setTimeout(() => {
        setCurrentPage("ride-tracking");
      }, 500);

    } catch (err) {
      console.error("Booking Error:", err);
      setRequestStatus("Failed to book ride. Please try again.");
      setShowWaitingUI(false);
      setActiveRequest(null);
    }
  };

  // Filter drivers based on tab selection
  const filteredDrivers = cabType === "ALL"
    ? drivers
    : drivers.filter(d => d.cabType === cabType);

  return (
    <div className="driver-listing-page">
      {/* Waiting Overlay */}
      {showWaitingUI && activeRequest && (
        <WaitingForDriverUI
          driver={activeRequest}
          distance={activeRequest.distanceFromUser}
          fare={estimatedFare}
          pickupLocation={userLocation}
          dropLocation={dropLocation}
          timeRemaining={timeRemaining}
          onCancel={() => {
            setActiveRequest(null);
            setShowWaitingUI(false);
          }}
          onTimeout={() => {
            setActiveRequest(null);
            setShowWaitingUI(false);
          }}
          // Passing simulate function to the UI for demo purposes
          onSimulateAccept={() => handleDriverAccept(activeRequest)}
        />
      )}

      {/* Main UI */}
      {!showWaitingUI && (
        <>
          <div className="header-section">
            <button className="back-btn-icon" onClick={() => setCurrentPage("cab-booking")}>
              ←
            </button>
            <h2>Select Your Ride</h2>
          </div>

          <div className="booking-panel">
            {/* Destination Input */}
            <DestinationInput
              onDestinationSet={handleDestinationSet}
              userLocation={userLocation}
            />

            {/* Trip Summary Card */}
            {dropLocation && (
              <div className="trip-summary">
                <div className="summary-item">
                  <span className="label">Distance</span>
                  <span className="value">{tripDistance.toFixed(1)} km</span>
                </div>
                <div className="summary-item">
                  <span className="label">Est. Time</span>
                  <span className="value">{Math.ceil(tripDistance * 3)} min</span>
                </div>
              </div>
            )}

            {/* Cab Type Filter */}
            <div className="cab-filter">
              {["ALL", "MINI", "SEDAN", "SUV", "LUXURY"].map(type => (
                <button
                  key={type}
                  className={`filter-btn ${cabType === type ? "active" : ""}`}
                  onClick={() => setCabType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {errorMsg && <div className="error-banner">{errorMsg}</div>}

            {/* Drivers Grid */}
            <div className="drivers-grid">
              {loadingDrivers ? (
                <div className="loader">Finding drivers...</div>
              ) : filteredDrivers.length === 0 ? (
                <div className="empty-state">
                  <h3>No drivers found</h3>
                  <p>Try changing your cab type or checking back later.</p>
                </div>
              ) : (
                filteredDrivers.map(driver => (
                  <div key={driver.id} className="driver-card-modern">
                    <div className="card-header">
                      <div className="cab-badge">{driver.cabType}</div>
                      <div className="rating-badge">⭐ {driver.rating || "4.8"}</div>
                    </div>

                    <div className="driver-avatar-section">
                      <div className="avatar-circle">
                        {driver.driverName.charAt(0)}
                      </div>
                      <div className="driver-details">
                        <h4>{driver.driverName}</h4>
                        <p>{driver.model} • {driver.cabNumber}</p>
                      </div>
                    </div>

                    <div className="card-stats">
                      <div className="stat">
                        <small>Distance</small>
                        <strong>{driver.distanceFromUser.toFixed(1)} km</strong>
                      </div>
                      <div className="stat">
                        <small>Fare</small>
                        <strong>₹{calculateFare(tripDistance, driver.cabType).toFixed(0)}</strong>
                      </div>
                    </div>

                    <button
                      className="book-btn"
                      onClick={() => handleSendRequest(driver)}
                      disabled={!dropLocation}
                    >
                      {dropLocation ? "Book Now" : "Set Destination"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverListingPage;
