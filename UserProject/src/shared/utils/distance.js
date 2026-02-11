/**
 * Distance Calculation Utilities
 * Haversine formula and distance-related utilities
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
}

/**
 * Calculate estimated time based on distance
 * @param {number} distance - Distance in kilometers
 * @param {number} avgSpeed - Average speed in km/h (default: 40)
 * @returns {number} Estimated time in minutes
 */
export function calculateEstimatedTime(distance, avgSpeed = 40) {
    const timeInHours = distance / avgSpeed;
    const timeInMinutes = timeInHours * 60;
    return Math.ceil(timeInMinutes);
}

/**
 * Format time for display
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
export function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
}

/**
 * Calculate fare based on distance and cab type
 * @param {number} distance - Distance in kilometers
 * @param {object} cabType - Cab type configuration
 * @returns {number} Calculated fare
 */
export function calculateFare(distance, cabType) {
    const { basePrice, pricePerKm } = cabType;
    const fare = basePrice + (distance * pricePerKm);
    return Math.round(fare);
}

/**
 * Format fare for display
 * @param {number} fare - Fare amount
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted fare string
 */
export function formatFare(fare, currency = '₹') {
    return `${currency}${fare.toFixed(2)}`;
}

/**
 * Check if a location is within radius
 * @param {object} center - Center location {lat, lng}
 * @param {object} point - Point to check {lat, lng}
 * @param {number} radius - Radius in kilometers
 * @returns {boolean} True if within radius
 */
export function isWithinRadius(center, point, radius) {
    const distance = calculateDistance(
        center.lat,
        center.lng,
        point.lat,
        point.lng
    );
    return distance <= radius;
}

/**
 * Sort locations by distance from a reference point
 * @param {array} locations - Array of locations with lat/lng
 * @param {object} reference - Reference location {lat, lng}
 * @returns {array} Sorted array of locations
 */
export function sortByDistance(locations, reference) {
    return locations
        .map(location => ({
            ...location,
            distance: calculateDistance(
                reference.lat,
                reference.lng,
                location.lat,
                location.lng
            ),
        }))
        .sort((a, b) => a.distance - b.distance);
}
