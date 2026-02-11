/**
 * Route Constants
 * Centralized route definitions for the application
 */

// User App Routes
export const USER_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    BOOK_RIDE: '/book',
    RIDE_TRACKING: '/ride-tracking',
    RIDE_HISTORY: '/rides',
    PAYMENT: '/payment',
    SETTINGS: '/settings',
};

// Driver App Routes
export const DRIVER_ROUTES = {
    HOME: '/driver',
    LOGIN: '/driver/login',
    REGISTER: '/driver/register',
    DASHBOARD: '/driver/dashboard',
    REQUESTS: '/driver/requests',
    ACTIVE_RIDE: '/driver/active-ride',
    HISTORY: '/driver/history',
    EARNINGS: '/driver/earnings',
    PROFILE: '/driver/profile',
    SETTINGS: '/driver/settings',
};

// Shared Routes
export const SHARED_ROUTES = {
    ROLE_SELECTION: '/role-selection',
    QUICK_ACCESS: '/quick-access',
    NOT_FOUND: '/404',
};

// All Routes Combined
export const ROUTES = {
    ...USER_ROUTES,
    ...DRIVER_ROUTES,
    ...SHARED_ROUTES,
};

// Route Metadata
export const ROUTE_META = {
    [USER_ROUTES.HOME]: {
        title: 'Home - QuickCab',
        requiresAuth: false,
        role: 'user',
    },
    [USER_ROUTES.LOGIN]: {
        title: 'Login - QuickCab',
        requiresAuth: false,
        role: 'user',
    },
    [USER_ROUTES.REGISTER]: {
        title: 'Register - QuickCab',
        requiresAuth: false,
        role: 'user',
    },
    [USER_ROUTES.PROFILE]: {
        title: 'Profile - QuickCab',
        requiresAuth: true,
        role: 'user',
    },
    [USER_ROUTES.BOOK_RIDE]: {
        title: 'Book a Ride - QuickCab',
        requiresAuth: true,
        role: 'user',
    },
    [USER_ROUTES.RIDE_TRACKING]: {
        title: 'Track Ride - QuickCab',
        requiresAuth: true,
        role: 'user',
    },
    [USER_ROUTES.RIDE_HISTORY]: {
        title: 'Ride History - QuickCab',
        requiresAuth: true,
        role: 'user',
    },
    [DRIVER_ROUTES.DASHBOARD]: {
        title: 'Dashboard - QuickCab Driver',
        requiresAuth: true,
        role: 'driver',
    },
    [DRIVER_ROUTES.REQUESTS]: {
        title: 'Ride Requests - QuickCab Driver',
        requiresAuth: true,
        role: 'driver',
    },
    [DRIVER_ROUTES.ACTIVE_RIDE]: {
        title: 'Active Ride - QuickCab Driver',
        requiresAuth: true,
        role: 'driver',
    },
    [DRIVER_ROUTES.HISTORY]: {
        title: 'Ride History - QuickCab Driver',
        requiresAuth: true,
        role: 'driver',
    },
};

export default ROUTES;
