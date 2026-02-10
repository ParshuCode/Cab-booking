import React, { useState, useEffect } from 'react';
import './UserRideTracking.css';

/**
 * User Ride Tracking Component
 * Shows active ride status and driver details
 * Updates in real-time when driver accepts
 */
const UserRideTracking = ({ onCancel }) => {
  const [activeRide, setActiveRide] = useState(null);
  const [driverAccepted, setDriverAccepted] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [waitingTime, setWaitingTime] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Initialize active ride from localStorage
  useEffect(() => {
    const savedRide = localStorage.getItem('currentUserRide');
    if (savedRide) {
      setActiveRide(JSON.parse(savedRide));
    }

    // Poll for driver acceptance every 2 seconds
    const interval = setInterval(() => {
      const savedRide = localStorage.getItem('currentUserRide');
      const driverInfo = localStorage.getItem('driverAcceptedRide');
      
      if (savedRide && driverInfo) {
        setActiveRide(JSON.parse(savedRide));
        setDriverAccepted(true);
        setDriverDetails(JSON.parse(driverInfo));
        clearInterval(interval); // Stop polling once driver accepts
      }

      // Update waiting time
      setWaitingTime(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCancelRide = () => {
    localStorage.removeItem('currentUserRide');
    localStorage.removeItem('driverAcceptedRide');
    if (onCancel) onCancel();
  };

  if (!activeRide) {
    return (
      <div className="ride-tracking-container">
        <div className="empty-state">
          <div className="empty-icon">🚕</div>
          <h2>No Active Ride</h2>
          <p>Start a new booking to see your ride status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-tracking-container">
      <div className="ride-tracking-header">
        <h2>🚗 Ride Status</h2>
        <button className="cancel-ride-btn" onClick={handleCancelRide}>
          ❌ Cancel Ride
        </button>
      </div>

      {!driverAccepted ? (
        <div className="waiting-for-driver">
          <div className="waiting-animation">
            <div className="pulse-circle"></div>
            <div className="pulse-circle pulse-delay-1"></div>
            <div className="pulse-circle pulse-delay-2"></div>
          </div>
          <h3>⏳ Waiting for driver to accept...</h3>
          <p>Waiting time: {Math.floor(waitingTime / 2)}s</p>

          <div className="ride-details-card">
            <h4>📍 Your Booking Details</h4>
            <div className="detail-row">
              <span className="label">Pickup:</span>
              <span className="value">{activeRide.pickupLocation}</span>
            </div>
            <div className="detail-row">
              <span className="label">Dropoff:</span>
              <span className="value">{activeRide.dropoffLocation}</span>
            </div>
            <div className="detail-row">
              <span className="label">Distance:</span>
              <span className="value">{activeRide.tripDistance.toFixed(1)} km</span>
            </div>
            <div className="detail-row">
              <span className="label">Fare:</span>
              <span className="value highlight">₹{activeRide.estimatedFare.toFixed(0)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Vehicle:</span>
              <span className="value">{activeRide.cabName}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="driver-accepted">
          <div className="acceptance-badge">✅ Driver Accepted!</div>

          <div className="driver-card">
            <div className="driver-header-section">
              <div className="driver-large-avatar">
                {driverDetails?.name?.charAt(0) || '?'}
              </div>
              <div className="driver-main-info">
                <h3>{driverDetails?.name || 'Driver'}</h3>
                <div className="driver-rating">
                  ⭐ {driverDetails?.rating || 4.8} • {driverDetails?.totalRides || 0} rides
                </div>
              </div>
            </div>

            <div className="vehicle-section">
              <div className="vehicle-info">
                <span className="label">🚗 Vehicle:</span>
                <span className="value">{driverDetails?.cabNumber}</span>
              </div>
              <div className="vehicle-info">
                <span className="label">Type:</span>
                <span className="value">{activeRide.cabName}</span>
              </div>
            </div>

            <div className="location-section">
              <h4>📍 Location Details</h4>
              <div className="detail-row">
                <span className="label">Driver Distance:</span>
                <span className="value">{driverDetails?.distanceFromUser?.toFixed(1) || '0'} km away</span>
              </div>
              <div className="detail-row">
                <span className="label">ETA:</span>
                <span className="value">{driverDetails?.responseTime || '2 min'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Driver Current Location:</span>
                <span className="value">Lat: {driverDetails?.currentLocation?.lat?.toFixed(4)}, Lng: {driverDetails?.currentLocation?.lng?.toFixed(4)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Your Location:</span>
                <span className="value">Lat: {activeRide.pickupCoords?.lat?.toFixed(4)}, Lng: {activeRide.pickupCoords?.lng?.toFixed(4)}</span>
              </div>
            </div>

            <div className="trip-section">
              <h4>🛣️ Your Trip</h4>
              <div className="detail-row">
                <span className="label">Pickup:</span>
                <span className="value">{activeRide.pickupLocation}</span>
              </div>
              <div className="detail-row">
                <span className="label">Dropoff:</span>
                <span className="value">{activeRide.dropoffLocation}</span>
              </div>
              <div className="detail-row">
                <span className="label">Distance:</span>
                <span className="value">{activeRide.tripDistance?.toFixed(1)} km</span>
              </div>
              <div className="detail-row">
                <span className="label">Estimated Fare:</span>
                <span className="value highlight">₹{activeRide.estimatedFare?.toFixed(0)}</span>
              </div>
            </div>

            <div className="contact-section">
              <h4>📞 Driver Contact</h4>
              <div className="contact-buttons">
                <button className="contact-btn call-btn">📞 Call Driver</button>
                <button className="contact-btn message-btn">💬 Message</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRideTracking;
