import React from 'react';
import './Home.css';

const Home = ({ user, onPageChange }) => {
  const features = [
    {
      icon: '�',
      title: 'Instant Booking',
      description: 'Book your cab in seconds with our intuitive interface'
    },
    {
      icon: '💳',
      title: 'Transparent Pricing',
      description: 'No hidden charges, pay exactly what you see upfront'
    },
    {
      icon: '🕐',
      title: 'Always Available',
      description: '24/7 service for your morning commute to late-night rides'
    },
    {
      icon: '⭐',
      title: 'Trusted & Safe',
      description: 'Verified drivers and real-time tracking for your safety'
    }
  ];

  const cabTypes = [
    {
      type: 'STANDARD',
      name: 'Standard',
      price: '₹10/km',
      passengers: '4',
      description: 'Perfect for everyday travel',
      icon: '🚙'
    },
    {
      type: 'PREMIUM',
      name: 'Premium',
      price: '₹15/km',
      passengers: '4',
      description: 'Comfortable premium experience',
      icon: '🚘'
    },
    {
      type: 'SUV',
      name: 'SUV',
      price: '₹18/km',
      passengers: '6',
      description: 'Spacious for groups and families',
      icon: '🚐'
    },
    {
      type: 'LUXURY',
      name: 'Luxury',
      price: '₹25/km',
      passengers: '4',
      description: 'Premium luxury experience',
      icon: '🏎️'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container flex-between" style={{ minHeight: '100vh', alignItems: 'center' }}>
          <div className="hero-content">
            <span className="badge">Welcome to CabBook</span>
            <h1>Your Journey Awaits</h1>
            <p className="hero-subtitle">Fast, reliable, and affordable cab booking at your fingertips</p>
            {!user ? (
              <div className="hero-buttons">
                <button
                  className="btn-primary btn-large"
                  onClick={() => onPageChange('register')}
                >
                  Get Started
                </button>
                <button
                  className="btn-secondary btn-large"
                  onClick={() => onPageChange('login')}
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="hero-buttons">
                <button
                  className="btn-primary btn-large"
                  onClick={() => onPageChange('book')}
                >
                  🗺️ Book Now
                </button>
                <button
                  className="btn-secondary btn-large"
                  onClick={() => onPageChange('bookings')}
                >
                  📋 View Bookings
                </button>
              </div>
            )}
          </div>
          <div className="hero-image">
            <div className="hero-visual">
              <div className="floating-icon large">🚗</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Happy Riders</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Rides Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Verified Drivers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.8★</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose CabBook?</h2>
            <p>Experience the best in cab booking services</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cab Types Section */}
      <section className="cab-types-section">
        <div className="container">
          <div className="section-header">
            <h2>Choose Your Perfect Ride</h2>
            <p>Select from our premium fleet of vehicles</p>
          </div>
          <div className="cab-types-grid">
            {cabTypes.map((cab, index) => (
              <div key={index} className="cab-type-card">
                <div className="cab-header">
                  <div className="cab-icon">{cab.icon}</div>
                  <span className="badge-secondary">{cab.passengers} Seat</span>
                </div>
                <h3>{cab.name}</h3>
                <div className="cab-price">{cab.price}</div>
                <p>{cab.description}</p>
                {user && (
                  <button 
                    className="btn-outline"
                    onClick={() => onPageChange('book')}
                  >
                    Book {cab.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Premium Cab Booking?</h2>
            <p>Join thousands of satisfied customers enjoying hassle-free rides</p>
            <div className="cta-buttons">
              {!user ? (
                <>
                  <button
                    className="btn-primary btn-large"
                    onClick={() => onPageChange('register')}
                  >
                    Create Account Now
                  </button>
                  <button
                    className="btn-outline btn-large"
                    onClick={() => onPageChange('login')}
                  >
                    Already have an account?
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary btn-large"
                  onClick={() => onPageChange('book')}
                >
                  Book Your Next Ride
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 