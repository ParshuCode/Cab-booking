import React, { useState, useEffect } from 'react';
import './UserRideTracking.css';

const UserRideTracking = ({ assignedCab, onCancel }) => {
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Initialize with passed assignedCab if available, or try localStorage
  useEffect(() => {
    let bookingId = assignedCab?.bookingId;
    if (!bookingId) {
      // Fallback to local storage if user refreshed
      const saved = localStorage.getItem('currentBookingId');
      if (saved) bookingId = JSON.parse(saved);
    }

    if (bookingId) {
      localStorage.setItem('currentBookingId', JSON.stringify(bookingId));
      fetchBookingStatus(bookingId);

      // Poll for updates
      const interval = setInterval(() => fetchBookingStatus(bookingId), 3000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [assignedCab]);

  const fetchBookingStatus = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:8077/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
        setStatus(data.status);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    try {
      // Call Payment API
      const res = await fetch("http://localhost:8077/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.fare,
          paymentMethod: "UPI"
        })
      });

      if (res.ok) {
        setStatus("PAID");
        alert("Payment Successful! Thank you for riding with us.");
        localStorage.removeItem('currentBookingId');
        if (onCancel) onCancel(); // Actually finishes the flow
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment error.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Ride Details...</div>;

  if (!booking) return (
    <div className="ride-tracking-container">
      <div className="empty-state">
        <h2>No Active Ride</h2>
        <button className="back-btn" onClick={onCancel}>Book a Ride</button>
      </div>
    </div>
  );

  return (
    <div className="ride-tracking-container">
      {/* Header Status Bar */}
      <div className={`status-header ${status}`}>
        <h2>{getStatusMessage(status)}</h2>
        <div className="booking-id">ID: #{booking.id}</div>
      </div>

      {/* Main Content Grid */}
      <div className="tracking-grid">

        {/* Left: Ride Timeline */}
        <div className="timeline-card">
          <h3>Ride Progress</h3>
          <div className="timeline">
            <TimelineItem
              active={true}
              completed={status !== "PENDING"}
              icon="📅"
              title="Booking Confirmed"
              time={new Date(booking.bookingTime).toLocaleTimeString()}
            />
            <TimelineItem
              active={status === "IN_PROGRESS" || status === "COMPLETED" || status === "PAID"}
              completed={status === "COMPLETED" || status === "PAID"}
              icon="🚖"
              title="Driver Arrived"
              time={booking.pickupTime ? new Date(booking.pickupTime).toLocaleTimeString() : "--:--"}
            />
            <TimelineItem
              active={status === "COMPLETED" || status === "PAID"}
              completed={status === "PAID"}
              icon="🏁"
              title="Ride Completed"
              time={booking.dropTime ? new Date(booking.dropTime).toLocaleTimeString() : "--:--"}
            />
          </div>
        </div>

        {/* Right: Driver & Cab Info */}
        <div className="info-column">
          {/* Driver Card */}
          <div className="driver-card-large">
            <div className="driver-header">
              <div className="driver-avatar">{booking.driverName ? booking.driverName.charAt(0) : "D"}</div>
              <div>
                <h3>{booking.driverName || "Assigning Driver..."}</h3>
                <p>{booking.cabNumber || "Vehicle Info"}</p>
              </div>
              <div className="rating-pill">⭐ 4.8</div>
            </div>
            <div className="action-row">
              <button className="call-btn">📞 Call</button>
              <button className="msg-btn">💬 Message</button>
            </div>
          </div>

          {/* Trip Details */}
          <div className="trip-card">
            <div className="location-row">
              <div className="dot green"></div>
              <div>
                <small>Pickup</small>
                <p>{booking.pickupLocation?.address || "Pickup Location"}</p>
              </div>
            </div>
            <div className="line-connector"></div>
            <div className="location-row">
              <div className="dot red"></div>
              <div>
                <small>Dropoff</small>
                <p>{booking.dropLocation?.address || "Dropoff Location"}</p>
              </div>
            </div>

            <hr />

            <div className="fare-row">
              <span>Total Fare</span>
              <span className="fare-amount">₹{booking.fare}</span>
            </div>
          </div>

          {/* Payment Section */}
          {status === "COMPLETED" && (
            <div className="payment-card">
              <h3>Payment Due</h3>
              <p>Please complete your payment of ₹{booking.fare}</p>
              <button
                className="pay-now-btn"
                onClick={handlePayment}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? "Processing..." : "Pay Now (UPI)"}
              </button>
            </div>
          )}

          {status === "PAID" && (
            <div className="payment-success-card">
              <h3>✅ Payment Successful</h3>
              <button className="home-btn" onClick={onCancel}>Book Another Ride</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components & Functions
const TimelineItem = ({ active, completed, icon, title, time }) => (
  <div className={`timeline-item ${completed ? 'completed' : ''} ${active ? 'active' : ''}`}>
    <div className="timeline-icon">{completed ? '✅' : icon}</div>
    <div className="timeline-content">
      <h4>{title}</h4>
      <small>{time}</small>
    </div>
  </div>
);

const getStatusMessage = (status) => {
  switch (status) {
    case 'PENDING': return "Finding you a driver...";
    case 'CONFIRMED': return "Driver is on the way!";
    case 'IN_PROGRESS': return "Ride in progress...";
    case 'COMPLETED': return "Ride Completed. Payment Pending.";
    case 'PAID': return "Ride Closed.";
    case 'CANCELLED': return "Ride Cancelled";
    default: return "Status Unknown";
  }
};

export default UserRideTracking;
