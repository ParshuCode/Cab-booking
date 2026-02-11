/**
 * API Endpoints Configuration
 * Centralized API endpoint definitions for the application
 */

// Base URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080';

// Service Ports
export const SERVICES = {
    EUREKA: 8761,
    USER_SERVICE: 8075,
    CAB_SERVICE: 8076,
    BOOKING_SERVICE: 8077,
};

// API Endpoints
export const API_ENDPOINTS = {
    // User Service Endpoints
    USER: {
        REGISTER: `${API_BASE_URL}/api/users/register`,
        LOGIN: `${API_BASE_URL}/api/users/login`,
        PROFILE: `${API_BASE_URL}/api/users/profile`,
        UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile/update`,
        LOGOUT: `${API_BASE_URL}/api/users/logout`,
    },

    // Driver Service Endpoints
    DRIVER: {
        REGISTER: `${API_BASE_URL}/api/drivers/register`,
        LOGIN: `${API_BASE_URL}/api/drivers/login`,
        PROFILE: `${API_BASE_URL}/api/drivers/profile`,
        UPDATE_PROFILE: `${API_BASE_URL}/api/drivers/profile/update`,
        UPDATE_STATUS: `${API_BASE_URL}/api/drivers/status`,
        UPDATE_LOCATION: `${API_BASE_URL}/api/drivers/location`,
        EARNINGS: `${API_BASE_URL}/api/drivers/earnings`,
        STATISTICS: `${API_BASE_URL}/api/drivers/statistics`,
        LOGOUT: `${API_BASE_URL}/api/drivers/logout`,
    },

    // Cab Service Endpoints
    CAB: {
        NEARBY: `${API_BASE_URL}/api/cabs/nearby`,
        AVAILABLE: `${API_BASE_URL}/api/cabs/available`,
        BY_TYPE: `${API_BASE_URL}/api/cabs/type`,
        DETAILS: `${API_BASE_URL}/api/cabs`,
        UPDATE_LOCATION: `${API_BASE_URL}/api/cabs/location`,
    },

    // Booking Service Endpoints
    BOOKING: {
        CREATE: `${API_BASE_URL}/api/bookings/create`,
        GET_BY_ID: `${API_BASE_URL}/api/bookings`,
        USER_BOOKINGS: `${API_BASE_URL}/api/bookings/user`,
        DRIVER_BOOKINGS: `${API_BASE_URL}/api/bookings/driver`,
        ACCEPT: `${API_BASE_URL}/api/bookings/accept`,
        REJECT: `${API_BASE_URL}/api/bookings/reject`,
        START: `${API_BASE_URL}/api/bookings/start`,
        COMPLETE: `${API_BASE_URL}/api/bookings/complete`,
        CANCEL: `${API_BASE_URL}/api/bookings/cancel`,
        HISTORY: `${API_BASE_URL}/api/bookings/history`,
    },

    // Location Service Endpoints
    LOCATION: {
        GEOCODE: `${API_BASE_URL}/api/location/geocode`,
        REVERSE_GEOCODE: `${API_BASE_URL}/api/location/reverse-geocode`,
        CALCULATE_DISTANCE: `${API_BASE_URL}/api/location/distance`,
        SEARCH: `${API_BASE_URL}/api/location/search`,
    },

    // Payment Service Endpoints
    PAYMENT: {
        PROCESS: `${API_BASE_URL}/api/payment/process`,
        VERIFY: `${API_BASE_URL}/api/payment/verify`,
        HISTORY: `${API_BASE_URL}/api/payment/history`,
    },

    // Rating Service Endpoints
    RATING: {
        SUBMIT: `${API_BASE_URL}/api/rating/submit`,
        GET_DRIVER_RATING: `${API_BASE_URL}/api/rating/driver`,
        GET_USER_RATING: `${API_BASE_URL}/api/rating/user`,
    },
};

// WebSocket Endpoints
export const WS_ENDPOINTS = {
    CONNECT: `${WS_BASE_URL}/ws`,
    RIDE_REQUESTS: '/topic/ride-requests',
    RIDE_UPDATES: '/topic/ride-updates',
    LOCATION_UPDATES: '/topic/location-updates',
    NOTIFICATIONS: '/topic/notifications',
};

// External API Endpoints
export const EXTERNAL_API = {
    OPENSTREETMAP: {
        SEARCH: 'https://nominatim.openstreetmap.org/search',
        REVERSE: 'https://nominatim.openstreetmap.org/reverse',
    },
    GOOGLE_MAPS: {
        GEOCODE: 'https://maps.googleapis.com/maps/api/geocode/json',
        DIRECTIONS: 'https://maps.googleapis.com/maps/api/directions/json',
    },
};

export default API_ENDPOINTS;
