import React, { useState } from "react";
import { useCabAssignmentAndTracking } from "../../hooks/useCabAssignmentAndTracking";
import LocationRequest from "./LocationRequest"; // Get user's GPS location
import DriverListingPage from "./DriverListingPage"; // Primary: list-based driver selection
import MapWithCabs from "./MapWithCabs"; // Fallback: map-based if needed

export default function BookCabPage({ 
  user, 
  pickupLocation, 
  dropLocation,
  setCurrentPage,
  setPickupLocation,
  setDropLocation
}) {
  const [rideRequested, setRideRequested] = useState(false);
  const [assignedCab, setAssignedCab] = useState(null);
  const [useMapMode, setUseMapMode] = useState(false); // Default: false = use driver listing
  const [locationConfirmed, setLocationConfirmed] = useState(!!pickupLocation); // Track if location is confirmed
  const { driverLoc, bookingStatus } = useCabAssignmentAndTracking(user?.id);

  function handleRideRequestSuccess() {
    setRideRequested(true);
  }

  // Step 1: Request location first
  if (!locationConfirmed || !pickupLocation) {
    return (
      <LocationRequest
        user={user}
        onLocationReceived={(location) => {
          console.log("✅ Location confirmed:", location);
          setPickupLocation({
            lat: location.lat,
            lng: location.lng,
            source: location.source
          });
          setLocationConfirmed(true);
        }}
      />
    );
  }

  // Step 2: Show driver listing with confirmed location
  if (true) { // Always use driver listing
    return (
      <DriverListingPage
        user={user}
        userLocation={pickupLocation}
        setCurrentPage={setCurrentPage}
        setPickupLocation={setPickupLocation}
        setDropLocation={setDropLocation}
        setAssignedCab={setAssignedCab}
      />
    );
  }

  // FALLBACK: Map mode (not used by default)
  return (
    <div>
      <MapWithCabs
        userLocation={pickupLocation}
        driverLocation={driverLoc}
        assignedCab={assignedCab}
      />
      <section style={{padding:"24px 0 0 0"}}>
        {!rideRequested && (
          <RideRequestForm
            user={user}
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
            onSuccess={handleRideRequestSuccess}
          />
        )}
        {rideRequested && bookingStatus === "awaiting" && (
          <div style={{color:"#6848ff", margin:"12px 0"}}>Ride requested. Awaiting driver assignment...</div>
        )}
        {bookingStatus === "assigned" && assignedCab && (
          <div style={{
            padding:"14px", background:"#e8e7fd", borderRadius:10, margin:"10px 0"}}>
            <b>Your cab is on its way!</b><br />
            <b>Driver:</b> {assignedCab.driverName} <br />
            <b>Vehicle:</b> {assignedCab.cabNumber} ({assignedCab.cabType}) <br />
            <b>Driver location:</b>{" "}
            {driverLoc ? `${driverLoc.lat.toFixed(5)}, ${driverLoc.lng.toFixed(5)}` : "Fetching..."}<br />
            <span style={{color:"green"}}>Watch the cab marker coming to you! 🚖</span>
          </div>
        )}
        {bookingStatus === "completed" && (
          <div style={{color:"#097821"}}>Ride completed! Thank you for riding with us.</div>
        )}
      </section>
    </div>
  );
}