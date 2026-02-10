import React, { useState, useEffect } from 'react';
import './DriverDashboardSimple.css';

const DriverDashboardSimple = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedRide, setAcceptedRide] = useState(null);
  const [driverStatus, setDriverStatus] = useState('online'); // online, offline, busy
  const [rideHistory, setRideHistory] = useState([]);
  const [earnings, setEarnings] = useState(2450);
  const [completedRides, setCompletedRides] = useState(256);
  const [rating, setRating] = useState(4.8);

  // Mock rides for history
  const mockRideHistory = [
    {
      id: 'RIDE001',
      passengerName: 'Rajesh Kumar',
      pickupLocation: 'MG Road, Bangalore',
      dropLocation: 'Koramangala, Bangalore',
      fare: 245,
      distance: 8.5,
      time: '45 mins',
      rating: 5,
      date: '2025-02-10 10:30 AM'
    },
    {
      id: 'RIDE002',
      passengerName: 'Priya Singh',
      pickupLocation: 'Indiranagar, Bangalore',
      dropLocation: 'Whitefield, Bangalore',
      fare: 320,
      distance: 12.3,
      time: '55 mins',
      rating: 4.5,
      date: '2025-02-10 2:15 PM'
    },
    {
      id: 'RIDE003',
      passengerName: 'Amit Patel',
      pickupLocation: 'Brigade Road, Bangalore',
      dropLocation: 'HSR Layout, Bangalore',
      fare: 185,
      distance: 6.2,
      time: '30 mins',
      rating: 5,
      date: '2025-02-10 5:45 PM'
    },
    {
      id: 'RIDE004',
      passengerName: 'Neha Sharma',
      pickupLocation: 'Airport, Bangalore',
      dropLocation: 'Whitefield, Bangalore',
      fare: 450,
      distance: 28,
      time: '1 hour 15 mins',
      rating: 4,
      date: '2025-02-09 8:20 AM'
    },
    {
      id: 'RIDE005',
      passengerName: 'Vikram Reddy',
      pickupLocation: 'Cubbon Park, Bangalore',
      dropLocation: 'BTM Layout, Bangalore',
      fare: 210,
      distance: 7.8,
      time: '40 mins',
      rating: 5,
      date: '2025-02-09 6:30 PM'
    },
  ];

  // Initialize history
  useEffect(() => {
    // Load from localStorage if available
    const savedHistory = localStorage.getItem('driverRideHistory');
    const savedEarnings = localStorage.getItem('driverEarnings');
    const savedCompletedRides = localStorage.getItem('driverCompletedRides');
    const savedRating = localStorage.getItem('driverRating');

    if (savedHistory) {
      setRideHistory(JSON.parse(savedHistory));
    } else {
      setRideHistory(mockRideHistory);
    }

    if (savedEarnings) setEarnings(parseInt(savedEarnings));
    if (savedCompletedRides) setCompletedRides(parseInt(savedCompletedRides));
    if (savedRating) setRating(parseFloat(savedRating));
  }, []);

  // Simulate incoming ride requests
  useEffect(() => {
    const timer = setInterval(() => {
      if (driverStatus === 'online' && !acceptedRide) {
        const mockRequests = [
          {
            id: 'REQ' + Date.now(),
            passengerName: 'Random User ' + Math.floor(Math.random() * 100),
            passengerRating: (3 + Math.random() * 2).toFixed(1),
            pickupLocation: 'Location A, Bangalore',
            dropLocation: 'Location B, Bangalore',
            fare: Math.floor(150 + Math.random() * 400),
            distance: (3 + Math.random() * 20).toFixed(1),
            receivedTime: new Date(),
            timeLeft: 15
          }
        ];
        setIncomingRequests(mockRequests);

        // Auto-reject after 15 seconds
        const rejectTimer = setTimeout(() => {
          setIncomingRequests([]);
        }, 15000);

        return () => clearTimeout(rejectTimer);
      }
    }, 8000);

    return () => clearInterval(timer);
  }, [driverStatus, acceptedRide]);

  // Countdown timer for incoming requests
  useEffect(() => {
    if (incomingRequests.length > 0) {
      const countdownTimer = setInterval(() => {
        setIncomingRequests(prev =>
          prev.map(req => ({
            ...req,
            timeLeft: Math.max(0, req.timeLeft - 1)
          })).filter(req => req.timeLeft > 0)
        );
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [incomingRequests]);

  const handleAcceptRide = (request) => {
    setAcceptedRide(request);
    setIncomingRequests([]);
    setDriverStatus('busy');

    // Save driver acceptance to localStorage so user can see it
    localStorage.setItem('driverAcceptedRide', JSON.stringify({
      id: 'DRV_CURRENT',
      name: 'Driver Name',
      rating: rating,
      totalRides: completedRides,
      cabNumber: 'KA01AB1234',
      currentLocation: { lat: 40.7150, lng: -74.0030 },
      distanceFromUser: 0.8,
      responseTime: '2 min'
    }));

    console.log('✅ Ride Accepted! User will see this update.');
  };

  const handleRejectRide = (requestId) => {
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleCompleteRide = () => {
    if (acceptedRide) {
      const ride = {
        ...acceptedRide,
        date: new Date().toLocaleString(),
        rating: 5
      };
      const updatedHistory = [ride, ...rideHistory];
      const updatedEarnings = earnings + acceptedRide.fare;
      const updatedRides = completedRides + 1;

      // Save to localStorage
      setRideHistory(updatedHistory);
      setEarnings(updatedEarnings);
      setCompletedRides(updatedRides);
      
      localStorage.setItem('driverRideHistory', JSON.stringify(updatedHistory));
      localStorage.setItem('driverEarnings', String(updatedEarnings));
      localStorage.setItem('driverCompletedRides', String(updatedRides));
      localStorage.setItem('driverRating', String(rating));
    }
    setAcceptedRide(null);
    setDriverStatus('online');
  };

  const toggleStatus = () => {
    if (driverStatus === 'online') {
      setDriverStatus('offline');
    } else if (driverStatus === 'offline') {
      setDriverStatus('busy');
    } else {
      setDriverStatus('online');
    }
  };

  const getStatusColor = () => {
    switch (driverStatus) {
      case 'online': return '#4CAF50';
      case 'offline': return '#999';
      case 'busy': return '#FF9800';
      default: return '#999';
    }
  };

  return (
    <div className="driver-dashboard-simple">
      {/* Header */}
      <div className="dashboard-header">
        <div className="driver-profile">
          <div className="driver-avatar">👨‍💼</div>
          <div className="driver-info">
            <h2>Driver Dashboard</h2>
            <p>Welcome back!</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="status-button"
            onClick={toggleStatus}
            style={{ backgroundColor: getStatusColor() }}
          >
            {driverStatus === 'online' && '🟢 Online'}
            {driverStatus === 'offline' && '⚪ Offline'}
            {driverStatus === 'busy' && '🔴 Busy'}
          </button>
          {onLogout && (
            <button
              className="logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-label">Rating</div>
            <div className="stat-value">{rating}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-label">Rides</div>
            <div className="stat-value">{completedRides}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Earnings</div>
            <div className="stat-value">₹{earnings}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📋 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 History
        </button>
      </div>

      {/* Dashboard Tab - Incoming Requests */}
      {activeTab === 'dashboard' && (
        <div className="tab-content">
          {!acceptedRide ? (
            <>
              {incomingRequests.length > 0 ? (
                <div className="incoming-requests">
                  {incomingRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <h3>{request.passengerName}</h3>
                        <div className="request-timer">
                          <span className={`timer ${request.timeLeft <= 5 ? 'critical' : ''}`}>
                            ⏱ {request.timeLeft}s
                          </span>
                        </div>
                      </div>

                      <div className="request-details">
                        <div className="detail-row">
                          <span className="label">📍 Pickup:</span>
                          <span className="value">{request.pickupLocation}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">🎯 Dropoff:</span>
                          <span className="value">{request.dropLocation}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">📏 Distance:</span>
                          <span className="value">{request.distance} km</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">💵 Fare:</span>
                          <span className="value highlight">₹{request.fare}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">⭐ Rating:</span>
                          <span className="value">{request.passengerRating}</span>
                        </div>
                      </div>

                      <div className="request-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleAcceptRide(request)}
                        >
                          ✅ Accept
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectRide(request.id)}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🚕</div>
                  <h3>No incoming rides</h3>
                  <p>You'll receive ride requests when they're available</p>
                </div>
              )}
            </>
          ) : (
            <div className="active-ride">
              <div className="ride-header">🚗 Active Ride</div>
              <div className="ride-details">
                <div className="detail-row">
                  <span className="label">👤 Passenger:</span>
                  <span className="value">{acceptedRide.passengerName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📍 Pickup:</span>
                  <span className="value">{acceptedRide.pickupLocation}</span>
                </div>
                <div className="detail-row">
                  <span className="label">🎯 Dropoff:</span>
                  <span className="value">{acceptedRide.dropLocation}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📏 Distance:</span>
                  <span className="value">{acceptedRide.distance} km</span>
                </div>
                <div className="detail-row">
                  <span className="label">💵 Fare:</span>
                  <span className="value highlight">₹{acceptedRide.fare}</span>
                </div>
              </div>

              <button className="btn-complete" onClick={handleCompleteRide}>
                ✅ Complete Ride
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="tab-content">
          <div className="history-list">
            {rideHistory.length > 0 ? (
              rideHistory.map((ride, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-header">
                    <h4>{ride.passengerName}</h4>
                    <span className="history-rating">⭐ {ride.rating}</span>
                  </div>
                  <div className="history-details">
                    <div className="detail-row">
                      <span className="label">📍</span>
                      <span className="value">{ride.pickupLocation} → {ride.dropLocation}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📏</span>
                      <span className="value">{ride.distance} km</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">💵</span>
                      <span className="value">₹{ride.fare}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📅</span>
                      <span className="value">{ride.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No ride history</h3>
                <p>Your completed rides will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboardSimple;
