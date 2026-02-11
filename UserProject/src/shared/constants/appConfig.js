/**
 * Application Configuration
 * Central configuration for the cab booking application
 */

export const APP_CONFIG = {
    // Application Info
    APP_NAME: 'QuickCab',
    APP_VERSION: '2.0.0',
    APP_DESCRIPTION: 'Modern Cab Booking System',

    // Environment
    ENV: import.meta.env.MODE || 'development',
    IS_DEVELOPMENT: import.meta.env.MODE === 'development',
    IS_PRODUCTION: import.meta.env.MODE === 'production',

    // API Configuration
    API_TIMEOUT: 30000, // 30 seconds
    API_RETRY_ATTEMPTS: 3,
    API_RETRY_DELAY: 1000, // 1 second

    // WebSocket Configuration
    WS_RECONNECT_INTERVAL: 5000, // 5 seconds
    WS_MAX_RECONNECT_ATTEMPTS: 5,
    WS_HEARTBEAT_INTERVAL: 30000, // 30 seconds

    // Location Configuration
    DEFAULT_LOCATION: {
        lat: 28.6139,
        lng: 77.2090,
        name: 'New Delhi, India',
    },
    LOCATION_SEARCH_RADIUS: 5, // km
    MAX_NEARBY_DRIVERS: 20,
    LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds

    // Booking Configuration
    RIDE_REQUEST_TIMEOUT: 15000, // 15 seconds
    RIDE_SEARCH_TIMEOUT: 30000, // 30 seconds
    MAX_BOOKING_HISTORY: 50,

    // Cab Types
    CAB_TYPES: {
        ECONOMY: {
            id: 'economy',
            name: 'Economy',
            description: 'Affordable rides for daily commute',
            basePrice: 50,
            pricePerKm: 10,
            capacity: 4,
            icon: '🚗',
        },
        PREMIUM: {
            id: 'premium',
            name: 'Premium',
            description: 'Comfortable rides with extra space',
            basePrice: 100,
            pricePerKm: 15,
            capacity: 4,
            icon: '🚙',
        },
        LUXURY: {
            id: 'luxury',
            name: 'Luxury',
            description: 'Premium experience with top-tier vehicles',
            basePrice: 200,
            pricePerKm: 25,
            capacity: 4,
            icon: '🚘',
        },
        SUV: {
            id: 'suv',
            name: 'SUV',
            description: 'Spacious rides for groups',
            basePrice: 150,
            pricePerKm: 20,
            capacity: 6,
            icon: '🚐',
        },
    },

    // Booking Status
    BOOKING_STATUS: {
        PENDING: 'PENDING',
        CONFIRMED: 'CONFIRMED',
        DRIVER_ARRIVED: 'DRIVER_ARRIVED',
        IN_PROGRESS: 'IN_PROGRESS',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
        REJECTED: 'REJECTED',
    },

    // Driver Status
    DRIVER_STATUS: {
        ONLINE: 'ONLINE',
        BUSY: 'BUSY',
        OFFLINE: 'OFFLINE',
    },

    // Payment Methods
    PAYMENT_METHODS: {
        CASH: { id: 'cash', name: 'Cash', icon: '💵' },
        CARD: { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
        UPI: { id: 'upi', name: 'UPI', icon: '📱' },
        WALLET: { id: 'wallet', name: 'Wallet', icon: '👛' },
    },

    // Rating Configuration
    MAX_RATING: 5,
    MIN_RATING: 1,

    // UI Configuration
    TOAST_DURATION: 3000, // 3 seconds
    MODAL_ANIMATION_DURATION: 300, // 300ms
    DEBOUNCE_DELAY: 500, // 500ms
    THROTTLE_DELAY: 1000, // 1 second

    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,

    // File Upload
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],

    // Validation
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 50,
    PHONE_NUMBER_LENGTH: 10,
    OTP_LENGTH: 6,

    // Map Configuration
    MAP_DEFAULT_ZOOM: 13,
    MAP_MAX_ZOOM: 18,
    MAP_MIN_ZOOM: 10,

    // Storage Keys
    STORAGE_KEYS: {
        USER_TOKEN: 'user_token',
        DRIVER_TOKEN: 'driver_token',
        USER_ROLE: 'user_role',
        USER_DATA: 'user_data',
        DRIVER_DATA: 'driver_data',
        THEME: 'theme',
        LANGUAGE: 'language',
    },

    // Feature Flags
    FEATURES: {
        ENABLE_WEBSOCKET: true,
        ENABLE_NOTIFICATIONS: true,
        ENABLE_LOCATION_TRACKING: true,
        ENABLE_RIDE_SHARING: false,
        ENABLE_SCHEDULED_RIDES: false,
        ENABLE_CHAT: false,
    },

    // Error Messages
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        SERVER_ERROR: 'Server error. Please try again later.',
        UNAUTHORIZED: 'Unauthorized. Please login again.',
        VALIDATION_ERROR: 'Please check your input and try again.',
        LOCATION_ERROR: 'Unable to get your location. Please enable location services.',
        BOOKING_ERROR: 'Unable to create booking. Please try again.',
    },

    // Success Messages
    SUCCESS_MESSAGES: {
        LOGIN_SUCCESS: 'Login successful!',
        REGISTER_SUCCESS: 'Registration successful!',
        BOOKING_SUCCESS: 'Booking created successfully!',
        PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
        PAYMENT_SUCCESS: 'Payment completed successfully!',
    },
};

export default APP_CONFIG;
