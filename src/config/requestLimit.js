const createRateLimiter = require('../middleware/rateLimiting');

const loginLimiter = createRateLimiter(15, 5);
const registerLimiter = createRateLimiter(15, 3);
const otpLimiter = createRateLimiter(10, 3);
const apiLimiter = createRateLimiter(1, 60);
const emergencyLimiter = createRateLimiter(1, 5);

module.exports = {
    loginLimiter,
    registerLimiter,
    otpLimiter,
    apiLimiter,
    emergencyLimiter
}