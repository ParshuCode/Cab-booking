package com.cabbooking.bookingservice.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.cabbooking.bookingservice.dto.RideRequestDTO;
import com.cabbooking.bookingservice.dto.DriverConfirmationDTO;
import com.cabbooking.bookingservice.service.BookingService;
import com.cabbooking.bookingservice.model.Booking;

/**
 * WebSocket controller for real-time ride request and confirmation handling
 * Allows drivers and users to communicate during booking process
 */
@Controller
public class RideRequestWebSocketController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * User sends a ride request to a specific driver
     * Payload: {bookingId, driverId, pickupLat, pickupLng, dropLat, dropLng, distance, fare}
     */
    @MessageMapping("/ride-request/{driverId}")
    public void sendRideRequest(@DestinationVariable Long driverId, RideRequestDTO request) {
        // Send ride request to the specific driver
        messagingTemplate.convertAndSend(
            "/topic/driver/" + driverId + "/ride-request",
            request
        );
        
        System.out.println("📤 Ride request sent to driver " + driverId + 
                          " for booking " + request.getBookingId());
    }
    
    /**
     * Driver confirms or rejects a ride request
     * Payload: {bookingId, driverId, status: "ACCEPTED" or "REJECTED", reason}
     */
    @MessageMapping("/driver-confirmation")
    public void handleDriverConfirmation(DriverConfirmationDTO confirmation) {
        Long bookingId = confirmation.getBookingId();
        Long driverId = confirmation.getDriverId();
        String status = confirmation.getStatus();
        
        System.out.println("📥 Driver " + driverId + " sent: " + status + 
                          " for booking " + bookingId);
        
        // Update booking in database
        try {
            if ("ACCEPTED".equals(status)) {
                Booking updatedBooking = bookingService.acceptRideByDriver(bookingId, driverId);
                
                // Send confirmation back to user
                Map<String, Object> response = new HashMap<>();
                response.put("status", "CONFIRMED");
                response.put("booking", updatedBooking);
                response.put("message", "Driver accepted your ride!");
                
                messagingTemplate.convertAndSend(
                    "/topic/user/" + updatedBooking.getUserId() + "/confirmation",
                    response
                );
                
                System.out.println("✅ Booking " + bookingId + " CONFIRMED");
                
            } else if ("REJECTED".equals(status)) {
                // Send rejection to user so they can try another driver
                Map<String, Object> response = new HashMap<>();
                response.put("status", "REJECTED");
                response.put("bookingId", bookingId);
                response.put("reason", confirmation.getReason() != null ? confirmation.getReason() : "Driver declined");
                
                Booking booking = bookingService.getBookingById(bookingId).orElse(null);
                if (booking != null) {
                    messagingTemplate.convertAndSend(
                        "/topic/user/" + booking.getUserId() + "/rejection",
                        response
                    );
                }
                
                System.out.println("❌ Booking " + bookingId + " REJECTED by driver");
            }
        } catch (Exception ex) {
            System.err.println("Error processing driver confirmation: " + ex.getMessage());
            
            // Send error to user
            Map<String, Object> error = new HashMap<>();
            error.put("status", "ERROR");
            error.put("message", "Could not process your request. Please try again.");
            
            Booking booking = bookingService.getBookingById(bookingId).orElse(null);
            if (booking != null) {
                messagingTemplate.convertAndSend(
                    "/topic/user/" + booking.getUserId() + "/error",
                    error
                );
            }
        }
    }
    
    /**
     * User sends driver details request
     * Used to fetch complete driver information for UI display
     */
    @MessageMapping("/driver-details/{driverId}")
    public void requestDriverDetails(@DestinationVariable Long driverId) {
        // This would fetch driver details from cab-service
        // Send to user
        messagingTemplate.convertAndSend(
            "/topic/driver-info/" + driverId,
            "Details fetched"
        );
    }
    
    /**
     * Driver sends a message to user (e.g., "Running late")
     */
    @MessageMapping("/driver-message/{userId}")
    public void sendDriverMessage(@DestinationVariable Long userId, Map<String, Object> message) {
        message.put("from", "driver");
        message.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSend(
            "/topic/user/" + userId + "/messages",
            message
        );
        
        System.out.println("💬 Message sent to user " + userId);
    }
}
