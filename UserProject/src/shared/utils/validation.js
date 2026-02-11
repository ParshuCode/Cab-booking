/**
 * Validation Utilities
 * Common validation functions for forms and inputs
 */

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} {isValid: boolean, errors: array}
 */
export function validatePassword(password) {
    const errors = [];

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 50) {
        errors.push('Password must be less than 50 characters');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if not empty
 */
export function isRequired(value) {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
}

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} min - Minimum length
 * @returns {boolean} True if meets minimum
 */
export function minLength(value, min) {
    return value.length >= min;
}

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} max - Maximum length
 * @returns {boolean} True if within maximum
 */
export function maxLength(value, max) {
    return value.length <= max;
}

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if within range
 */
export function inRange(value, min, max) {
    return value >= min && value <= max;
}

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if valid coordinates
 */
export function isValidCoordinates(lat, lng) {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}

/**
 * Validate OTP (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean} True if valid
 */
export function isValidOTP(otp) {
    const otpRegex = /^[0-9]{6}$/;
    return otpRegex.test(otp);
}

/**
 * Validate vehicle number (Indian format)
 * @param {string} vehicleNumber - Vehicle number to validate
 * @returns {boolean} True if valid
 */
export function isValidVehicleNumber(vehicleNumber) {
    // Format: XX00XX0000 (e.g., DL01AB1234)
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
    return vehicleRegex.test(vehicleNumber.replace(/\s/g, '').toUpperCase());
}

/**
 * Validate license number
 * @param {string} license - License number to validate
 * @returns {boolean} True if valid
 */
export function isValidLicense(license) {
    // Basic validation - adjust based on requirements
    return license.length >= 8 && license.length <= 20;
}

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Validate form data
 * @param {object} data - Form data to validate
 * @param {object} rules - Validation rules
 * @returns {object} {isValid: boolean, errors: object}
 */
export function validateForm(data, rules) {
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
        const value = data[field];
        const fieldRules = rules[field];

        fieldRules.forEach(rule => {
            if (rule.type === 'required' && !isRequired(value)) {
                errors[field] = rule.message || 'This field is required';
                isValid = false;
            }

            if (rule.type === 'email' && value && !isValidEmail(value)) {
                errors[field] = rule.message || 'Invalid email address';
                isValid = false;
            }

            if (rule.type === 'phone' && value && !isValidPhone(value)) {
                errors[field] = rule.message || 'Invalid phone number';
                isValid = false;
            }

            if (rule.type === 'minLength' && value && !minLength(value, rule.value)) {
                errors[field] = rule.message || `Minimum length is ${rule.value}`;
                isValid = false;
            }

            if (rule.type === 'maxLength' && value && !maxLength(value, rule.value)) {
                errors[field] = rule.message || `Maximum length is ${rule.value}`;
                isValid = false;
            }
        });
    });

    return { isValid, errors };
}
