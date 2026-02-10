import React, { useState } from "react";
import { useCabAssignmentAndTracking } from "../hooks/useCabAssignmentAndTracking";
import MapWithCabs from "./MapWithCabs"; // Your map, with a prop for a "cab marker"

export default function BookCabPage({ user, pickupLocation, dropLocation }) {
  const [rideRequested, setRideRequested] = useState(false);
  const { assignedCab, driverLoc, bookingStatus } = useCabAssignmentAndTracking(user?.id);

  // Your existing RideRequestForm
  function handleRideRequestSuccess() {
    setRideRequested(true);
  }

  return (
    <div>
      <MapWithCabs
        userLocation={pickupLocation}
        driverLocation={driverLoc}     // Pass for live marker!
        assignedCab={assignedCab}      // In case you want to show cab info in map!
      />
      <section style={{padding:"24px 0 0 0"}}>
        {!rideRequested && (
          <RideRequestForm
            user={user}
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
            onSuccess={handleRideRequestSuccess} // call this in your form after success!
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
            <b>Vehicle:</b> {assignedCab.cabNumber} ({assignedCab.model}, {assignedCab.cabType}) <br />
            <b>Driver location:</b>{" "}
            {driverLoc ? `${driverLoc.lat.toFixed(5)}, ${driverLoc.lng.toFixed(5)}` : "Fetching..."}<br />
            <span style={{color:"green"}}>Watch the cab marker coming to you in real time! 🚖</span>
          </div>
        )}
        {bookingStatus === "completed" && (
          <div style={{color:"#097821"}}>Ride completed! Thank you for riding with us.</div>
        )}
      </section>
    </div>
  );
}