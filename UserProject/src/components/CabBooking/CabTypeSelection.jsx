import React, { useState, useEffect } from "react";
import "./CabTypeSelection.css";

const CAB_METADATA = {
  MINI: { icon: "🚗", name: "Mini", description: "Compact & affordable" },
  SEDAN: { icon: "🚙", name: "Sedan", description: "Comfortable sedan" },
  SUV: { icon: "🚐", name: "SUV", description: "Spacious for groups" },
  LUXURY: { icon: "🚘", name: "Luxury", description: "Premium experience" }
};

const CabTypeSelection = ({
  onCabTypeSelect,
  tripDistance,
  userLocation
}) => {
  const [selectedCabType, setSelectedCabType] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLocation && tripDistance) {
      fetchEstimates();
    }
  }, [userLocation, tripDistance]);

  const fetchEstimates = async () => {
    setLoading(true);
    setError("");
    try {
      // Use the new endpoint we just added
      const response = await fetch(
        `http://localhost:8076/api/cabs/estimates?distance=${tripDistance}&lat=${userLocation.lat}&lng=${userLocation.lng}`
      );
      if (response.ok) {
        const data = await response.json();
        setEstimates(data);
      } else {
        setError("Failed to load vehicle options");
      }
    } catch (err) {
      console.error("Error fetching estimates:", err);
      setError("Network error loading prices");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (est) => {
    // metadata info
    const meta = CAB_METADATA[est.type] || { name: est.type, icon: "🚖", description: "Standard Ride" };

    // Construct the object expected by parent
    const selection = {
      id: est.type,
      name: meta.name,
      icon: meta.icon,
      estimatedFare: est.fare,
      ...est // include all backend data
    };

    setSelectedCabType(est.type);
    onCabTypeSelect(selection);
  };

  if (loading) return <div className="cab-selection-loading">Calculating best fares...</div>;
  if (error) return <div className="cab-selection-error">{error} <button onClick={fetchEstimates}>Retry</button></div>;

  return (
    <div className="cab-type-selection-container">
      <div className="selection-header">
        <h3>🚗 Select Vehicle Type</h3>
        <p className="selection-subtitle">
          Real-time pricing for {tripDistance.toFixed(1)} km
        </p>
      </div>

      <div className="cab-types-grid">
        {estimates.map((est) => {
          const meta = CAB_METADATA[est.type] || { icon: "🚖", name: est.type, description: "Standard Ride" };
          const isSelected = selectedCabType === est.type;

          return (
            <div
              key={est.type}
              className={`cab-type-card ${isSelected ? "selected" : ""}`}
              onClick={() => handleSelect(est)}
            >
              {isSelected && <div className="selected-badge">✓</div>}

              <div className="cab-icon">{meta.icon}</div>
              <div className="cab-name">{meta.name}</div>
              <div className="cab-description">{meta.description}</div>

              <div className="cab-capacity">
                <span className="capacity-icon">⏱️</span> {est.eta} away
              </div>

              <div className="cab-price">
                <div className="price-label">Est. Fare</div>
                <div className="price-value">₹{est.fare}</div>
              </div>

              <button
                className={`select-btn ${isSelected ? "selected-btn" : ""}`}
                onClick={(e) => { e.stopPropagation(); handleSelect(est); }}
              >
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          );
        })}
      </div>

      {estimates.length === 0 && (
        <div className="no-cabs-message">
          No cabs currently available in this area.
        </div>
      )}
    </div>
  );
};

export default CabTypeSelection;
