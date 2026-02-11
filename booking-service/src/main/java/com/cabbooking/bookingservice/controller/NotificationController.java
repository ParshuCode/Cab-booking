package com.cabbooking.bookingservice.controller;

import com.cabbooking.bookingservice.model.Notification;
import com.cabbooking.bookingservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationRepository.findByRecipientIdAndRecipientTypeOrderByTimestampDesc(userId, "USER"));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Notification>> getDriverNotifications(@PathVariable Long driverId) {
        return ResponseEntity.ok(notificationRepository.findByRecipientIdAndRecipientTypeOrderByTimestampDesc(driverId, "DRIVER"));
    }
}
