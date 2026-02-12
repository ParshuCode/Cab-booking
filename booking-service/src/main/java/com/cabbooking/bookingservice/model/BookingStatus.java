package com.cabbooking.bookingservice.model;

public enum BookingStatus {
	PENDING,           // Initial booking created
	DRIVER_ACCEPTED,   // Driver accepted the ride
	IN_PROGRESS,       // Ride started
	RIDE_ENDED,        // Driver marked ride as ended (user can now pay)
	PAYMENT_PENDING,   // User initiated payment
	PAID,              // Payment successful
	COMPLETED,         // Fully completed (after payment + feedback)
	CANCELLED          // Booking cancelled
}
