const rateLimit = require('express-rate-limit');

const createLimiter = (windowMinutes,maxRequests) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max : maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: "Too many requests. Please try again later.",
        }
    })
}

module.exports = createLimiter;