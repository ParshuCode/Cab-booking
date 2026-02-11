package com.cabbooking.cabservice.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.cabbooking.cabservice.dto.RideRequestDTO;
import com.cabbooking.cabservice.model.Cab;
import com.cabbooking.cabservice.model.Cab.CabStatus;
import com.cabbooking.cabservice.model.Location;
import com.cabbooking.cabservice.repository.CabRepository;

@Service
public class CabService {
    
    @Autowired
    private CabRepository cabRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public List<Cab> getAllCabs() {
        return cabRepository.findAll();
    }
    
    public Optional<Cab> getCabById(Long id) {
        return cabRepository.findById(id);
    }
    
    public List<Cab> getAvailableCabs() {
        return cabRepository.findByStatus(Cab.CabStatus.AVAILABLE);
    }
    
    public List<Cab> getCabsByType(Cab.CabType cabType) {
        return cabRepository.findByCabType(cabType);
    }
    
    public List<Cab> getAvailableCabsByType(Cab.CabType cabType) {
        return cabRepository.findByStatusAndCabType(Cab.CabStatus.AVAILABLE, cabType);
    }
    
    public List<Cab> searchCabsByLocation(String address) {
        return cabRepository.findByCurrentLocation_AddressContainingIgnoreCase(address);
    }
    
    public Cab addCab(Cab cab) {
        return cabRepository.save(cab);
    }
    
    public Cab updateCab(Long id, Cab cabDetails) {
        Cab cab = cabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cab not found"));
        
        cab.setCabNumber(cabDetails.getCabNumber());
        cab.setModel(cabDetails.getModel());
        cab.setColor(cabDetails.getColor());
        cab.setCapacity(cabDetails.getCapacity());
        cab.setBaseFare(cabDetails.getBaseFare());
        cab.setPerKmRate(cabDetails.getPerKmRate());
        cab.setCabType(cabDetails.getCabType());
        cab.setDriverName(cabDetails.getDriverName());
        cab.setDriverPhone(cabDetails.getDriverPhone());
        cab.setCurrentLocation(cabDetails.getCurrentLocation());
        
        return cabRepository.save(cab);
    }
    
    public Cab updateCabStatus(Long id, Cab.CabStatus status) {
        Cab cab = cabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cab not found"));
        cab.setStatus(status);
        return cabRepository.save(cab);
    }
    
    public void deleteCab(Long id) {
        cabRepository.deleteById(id);
    }
    
    public Double calculateFare(Long cabId, Double distance) {
        Cab cab = cabRepository.findById(cabId)
                .orElseThrow(() -> new RuntimeException("Cab not found"));
        return cab.getBaseFare() + (cab.getPerKmRate() * distance);
    }
    
    public void updateLocation(Long cabId, Double latitude, Double longitude) {
        Cab cab = cabRepository.findById(cabId).orElseThrow();
        Location location = cab.getCurrentLocation();
        if (location == null) location = new Location();
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        cab.setCurrentLocation(location);
        cabRepository.save(cab);
    }
    
    public List<Cab> findAvailableCabsNear(double lat, double lng, double radiusKm) {
        return cabRepository.findAll().stream()
            .filter(cab -> cab.getStatus() == CabStatus.AVAILABLE)
            .filter(cab -> cab.getCurrentLocation() != null)
            .filter(cab -> {
                Location loc = cab.getCurrentLocation();
                double dist = haversine(lat, lng, loc.getLatitude(), loc.getLongitude());
                return dist <= radiusKm;
            })
            .collect(Collectors.toList());
    }
    // Haversine (in KM)
    public static double haversine(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371; // Radius earth in KM
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng/2) * Math.sin(dLng/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    public void sendRideRequestToCabs(RideRequestDTO rideRequest) {
    	System.out.println("Publishing ride request to /topic/cab-requests: " + rideRequest);
        messagingTemplate.convertAndSend("/topic/cab-requests", rideRequest);
        // Optionally log or restrict by geolocation
    }

    public java.util.List<java.util.Map<String, Object>> getFareEstimates(Double distance, Double lat, Double lng) {
        List<Cab> available = findAvailableCabsNear(lat, lng, 10.0); // 10km radius
        
        // Group by type
        java.util.Map<Cab.CabType, List<Cab>> byType = available.stream()
            .collect(Collectors.groupingBy(Cab::getCabType));
            
        java.util.List<java.util.Map<String, Object>> estimates = new java.util.ArrayList<>();
        
        for (Cab.CabType type : Cab.CabType.values()) {
            List<Cab> cabs = byType.get(type);
            if (cabs == null || cabs.isEmpty()) continue;
            
            // Logic: Take average of baseFare + (rate * distance)
            double avgFare = cabs.stream()
                .mapToDouble(c -> c.getBaseFare() + (c.getPerKmRate() * distance))
                .average().orElse(0.0);
                
            // Find closest cab for ETA (assuming 40km/h avg speed -> 1.5 min per km)
            double minDist = cabs.stream()
                .mapToDouble(c -> haversine(lat, lng, c.getCurrentLocation().getLatitude(), c.getCurrentLocation().getLongitude()))
                .min().orElse(10.0);
                
            int etaMins = (int) Math.ceil(minDist * 2.5); // 2.5 mins per km roughly in city
            
            java.util.Map<String, Object> est = new java.util.HashMap<>();
            est.put("type", type.name());
            est.put("fare", Math.round(avgFare));
            est.put("eta", etaMins + " min");
            est.put("availableCount", cabs.size());
            
            estimates.add(est);
        }
        
        return estimates;
    }
    
} 