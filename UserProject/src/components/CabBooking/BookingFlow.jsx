import React, { useState, useEffect } from "react";
import "./BookingFlow.css";
import MultiStepDestinationInput from "./MultiStepDestinationInput";
import CabTypeSelection from "./CabTypeSelection";

/**
 * Complete Booking Flow Component
 * Flows:
 * 1. User enters pickup location (multi-step)
 * 2. User enters destination (multi-step)
 * 3. User confirms route
 * 4. User selects cab type
 * 5. System shows filtered drivers (only selected cab type)
 * 6. User confirms driver booking
 */
const BookingFlow = ({ userLocation = { lat: 40.7128, lng: -74.006 }, userName = "User" }) => {
  const [bookingStep, setBookingStep] = useState(1); // 1: Destination, 2: CabType, 3: DriverSelection, 4: Confirmation
  const [selectedLocations, setSelectedLocations] = useState(null);
  const [selectedCabType, setSelectedCabType] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  // Mock drivers data
  const allDrivers = [
    {
      id: "DRV001",
      name: "John Smith",
      rating: 4.8,
      totalRides: 256,
      cabType: "economy",
      cabNumber: "KA01AB1234",
      currentLocation: { lat: 40.7150, lng: -74.0030 },
      distanceFromUser: 0.8,
      responseTime: "2 min",
    },
    {
      id: "DRV002",
      name: "Sarah Johnson",
      rating: 4.7,
      totalRides: 189,
      cabType: "comfort",
      cabNumber: "KA01CD5678",
      currentLocation: { lat: 40.7100, lng: -73.9950 },
      distanceFromUser: 1.2,
      responseTime: "3 min",
    },
    {
      id: "DRV003",
      name: "Mike Chen",
      rating: 4.9,
      totalRides: 312,
      cabType: "economy",
      cabNumber: "KA01EF9012",
      currentLocation: { lat: 40.7200, lng: -74.0100 },
      distanceFromUser: 0.6,
      responseTime: "1 min",
    },
    {
      id: "DRV004",
      name: "Emma Davis",
      rating: 4.6,
      totalRides: 145,
      cabType: "premium",
      cabNumber: "KA01GH3456",
      currentLocation: { lat: 40.7080, lng: -73.9920 },
      distanceFromUser: 1.5,
      responseTime: "4 min",
    },
    {
      id: "DRV005",
      name: "Raj Kumar",
      rating: 4.8,
      totalRides: 267,
      cabType: "suv",
      cabNumber: "KA01IJ7890",
      currentLocation: { lat: 40.7250, lng: -74.0150 },
      distanceFromUser: 2.0,
      responseTime: "5 min",
    },
  ];

  // When cab type is selected, filter drivers
  useEffect(() => {
    if (selectedCabType) {
      const filtered = allDrivers.filter((driver) => driver.cabType === selectedCabType.id);
      setAvailableDrivers(filtered);
    }
  }, [selectedCabType]);

  // Handle destination completion
  const handleDestinationComplete = (destinations) => {
    setSelectedLocations(destinations);
    setBookingStep(2);
  };

  // Handle cab type selection
  const handleCabTypeSelect = (cabType) => {
    setSelectedCabType(cabType);
    setBookingStep(3);
  };

  // Handle driver selection
  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    setBookingStep(4);
  };

  // Handle final confirmation
  const handleConfirmBooking = () => {
    if (selectedLocations && selectedCabType && selectedDriver) {
      const bookingRequest = {
        userId: "USER_001",
        userName: userName,
        pickupLocation: selectedLocations.pickup.description,
        dropoffLocation: selectedLocations.destination.description,
        pickupCoords: selectedLocations.pickup,
        dropoffCoords: selectedLocations.destination,
        tripDistance: selectedLocations.destination.distance,
        estimatedFare: 50 + selectedLocations.destination.distance * 10,
        cabType: selectedCabType.id,
        cabName: selectedCabType.name,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        cabNumber: selectedDriver.cabNumber,
        requestTime: new Date().toISOString(),
      };

      console.log("Booking Request:", bookingRequest);

      // Save to localStorage for user tracking page
      localStorage.setItem('currentUserRide', JSON.stringify(bookingRequest));
      
      // Simulate driver receiving the request
      localStorage.setItem('pendingRideRequest', JSON.stringify({
        ...bookingRequest,
        driverId: selectedDriver.id
      }));

      // Send via WebSocket (if available)
      if (window.stompClient && window.stompClient.connected) {
        window.stompClient.send(
          `/app/ride-request/${selectedDriver.id}`,
          {},
          JSON.stringify(bookingRequest)
        );
      }

      alert("✅ Booking Confirmed! Waiting for driver to accept...");
      // Keep the booking state, show tracking page
      setBookingStep(5); // Add new step for tracking
      // Don't reset
    }
  };

  return (
    <div className="booking-flow-container">
      {/* Progress Bar */}
      <div className="booking-progress">
        <div className={`progress-step ${bookingStep >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <div className="step-name">Destination</div>
        </div>
        <div className={`progress-line ${bookingStep >= 2 ? "active" : ""}`}></div>
        <div className={`progress-step ${bookingStep >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-name">Vehicle</div>
        </div>
        <div className={`progress-line ${bookingStep >= 3 ? "active" : ""}`}></div>
        <div className={`progress-step ${bookingStep >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-name">Driver</div>
        </div>
        <div className={`progress-line ${bookingStep >= 4 ? "active" : ""}`}></div>
        <div className={`progress-step ${bookingStep >= 4 ? "active" : ""}`}>
          <div className="step-number">4</div>
          <div className="step-name">Confirm</div>
        </div>
      </div>

      {/* Step 1: Destination */}
      {bookingStep === 1 && (
        <div className="booking-step-content">
          <MultiStepDestinationInput
            userLocation={userLocation}
            onDestinationSet={handleDestinationComplete}
            onComplete={() => handleDestinationComplete}
          />
        </div>
      )}

      {/* Step 2: Cab Type Selection */}
      {bookingStep === 2 && selectedLocations && (
        <div className="booking-step-content">
          <CabTypeSelection
            onCabTypeSelect={handleCabTypeSelect}
            tripDistance={selectedLocations.destination.distance}
            estimatedFare={50 + selectedLocations.destination.distance * 10}
          />
          <button className="back-btn" onClick={() => setBookingStep(1)}>
            ← Back to Location
          </button>
        </div>
      )}

      {/* Step 3: Driver Selection */}
      {bookingStep === 3 && selectedLocations && selectedCabType && (
        <div className="booking-step-content">
          <div className="driver-selection-container">
            <h3>👨‍💼 Select Your Driver</h3>
            <p className="selection-info">
              {availableDrivers.length} {selectedCabType.name} drivers available
            </p>

            {availableDrivers.length > 0 ? (
              <div className="drivers-list">
                {availableDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`driver-card ${selectedDriver?.id === driver.id ? "selected" : ""}`}
                    onClick={() => handleDriverSelect(driver)}
                  >
                    {selectedDriver?.id === driver.id && <div className="driver-selected-badge">✓</div>}

                    <div className="driver-header">
                      <div className="driver-avatar">{driver.name.charAt(0)}</div>
                      <div className="driver-basic-info">
                        <div className="driver-name">{driver.name}</div>
                        <div className="driver-cab">
                          {driver.cabNumber} • {selectedCabType.name}
                        </div>
                      </div>
                      <div className="driver-distance">
                        <div className="distance-value">{driver.distanceFromUser.toFixed(1)} km</div>
                        <div className="time-eta">{driver.responseTime}</div>
                      </div>
                    </div>

                    <div className="driver-rating">
                      <span className="rating-stars">
                        {"⭐".repeat(Math.floor(driver.rating))}
                        {driver.rating % 1 >= 0.5 ? "✨" : ""}
                      </span>
                      <span className="rating-value">{driver.rating}</span>
                      <span className="rating-count">({driver.totalRides} rides)</span>
                    </div>

                    <button 
                      className={`select-driver-btn ${selectedDriver?.id === driver.id ? "selected-btn" : ""}`}
                      onClick={() => handleDriverSelect(driver)}
                    >
                      {selectedDriver?.id === driver.id ? "✓ Selected" : "Select"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-drivers">
                <div className="empty-state-icon">🚗</div>
                <p>No drivers available. Try another time.</p>
              </div>
            )}

            <div className="driver-selection-actions">
              <button className="back-btn" onClick={() => setBookingStep(2)}>
                ← Back to Vehicle
              </button>
              <button
                className="proceed-btn"
                onClick={() => setBookingStep(4)}
                disabled={!selectedDriver}
              >
                Review Booking →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {bookingStep === 4 && selectedLocations && selectedCabType && selectedDriver && (
        <div className="booking-step-content">
          <div className="confirmation-container">
            <h3>✅ Review Your Booking</h3>

            {/* Route Summary */}
            <div className="confirmation-card route-card">
              <h4>📍 Route</h4>
              <div className="route-detail">
                <div className="route-point from">
                  <div className="route-icon">📍</div>
                  <div className="route-address">
                    <div className="route-label">FROM</div>
                    <div className="route-value">{selectedLocations.pickup.description}</div>
                  </div>
                </div>
                <div className="route-arrow">↓</div>
                <div className="route-point to">
                  <div className="route-icon">🎯</div>
                  <div className="route-address">
                    <div className="route-label">TO</div>
                    <div className="route-value">{selectedLocations.destination.description}</div>
                  </div>
                </div>
              </div>
              <div className="route-stats">
                <div className="stat">
                  <span>📏 {selectedLocations.destination.distance.toFixed(2)} km</span>
                </div>
                <div className="stat">
                  <span>⏱️ ~{(selectedLocations.destination.distance / 40 * 60).toFixed(0)} min</span>
                </div>
              </div>
            </div>

            {/* Vehicle Summary */}
            <div className="confirmation-card vehicle-card">
              <h4>🚗 Vehicle</h4>
              <div className="vehicle-details">
                <div className="vehicle-icon">{selectedCabType.icon}</div>
                <div className="vehicle-info">
                  <div className="vehicle-type">{selectedCabType.name}</div>
                  <div className="vehicle-number">{selectedDriver.cabNumber}</div>
                </div>
              </div>
            </div>

            {/* Driver Summary */}
            <div className="confirmation-card driver-card">
              <h4>👨‍💼 Driver</h4>
              <div className="driver-confirmation">
                <div className="driver-conf-avatar">{selectedDriver.name.charAt(0)}</div>
                <div className="driver-conf-info">
                  <div className="driver-conf-name">{selectedDriver.name}</div>
                  <div className="driver-conf-rating">
                    ⭐ {selectedDriver.rating} • {selectedDriver.totalRides} rides
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Summary */}
            <div className="confirmation-card fare-card">
              <h4>💰 Estimated Fare</h4>
              <div className="fare-amount">
                ₹{(50 + selectedLocations.destination.distance * 10).toFixed(0)}
              </div>
              <div className="fare-note">Actual fare may vary based on traffic</div>
            </div>

            {/* Action Buttons */}
            <div className="confirmation-actions">
              <button className="cancel-btn" onClick={() => setBookingStep(1)}>
                ❌ Cancel
              </button>
              <button className="confirm-booking-btn" onClick={handleConfirmBooking}>
                ✅ Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Ride Tracking */}
      {bookingStep === 5 && selectedLocations && (
        <div className="booking-step-content tracking-step">
          <div className="ride-tracking-waiting">
            <div className="tracking-animation">
              <div className="tracking-pulse"></div>
              <div className="tracking-pulse delay-1"></div>
              <div className="tracking-pulse delay-2"></div>
            </div>
            <h3>⏳ Waiting for driver to accept...</h3>
            <p className="tracking-message">Your booking details have been sent to nearby drivers</p>

            <div className="booking-details-tracking">
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <span className="detail-text">{selectedLocations.pickup.description}</span>
              </div>
              <div className="arrow-down">↓</div>
              <div className="detail-item">
                <span className="detail-icon">🎯</span>
                <span className="detail-text">{selectedLocations.destination.description}</span>
              </div>
            </div>

            <div className="trip-info-tracking">
              <div className="info-badge">
                <span>📏</span>
                <span>{selectedLocations.destination.distance.toFixed(1)} km</span>
              </div>
              <div className="info-badge">
                <span>💵</span>
                <span>₹{(50 + selectedLocations.destination.distance * 10).toFixed(0)}</span>
              </div>
              <div className="info-badge">
                <span>🚗</span>
                <span>{selectedCabType?.name}</span>
              </div>
            </div>

            <button className="cancel-booking-btn" onClick={() => {
              localStorage.removeItem('currentUserRide');
              setBookingStep(1);
              setSelectedLocations(null);
              setSelectedCabType(null);
              setSelectedDriver(null);
            }}>
              ❌ Cancel Booking
            </button>

            <div className="tracking-note">
              <strong>💡 Tip:</strong> Once a driver accepts, you'll see their details and location
            </div>
          </div>
        </div>
      
      
        )}
    </div>
    );
}

export default BookingFlow; 