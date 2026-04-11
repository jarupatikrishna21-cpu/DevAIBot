import rateLimit from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 30, // 30 requests per minute
    standardHeaders: true, 
    legacyHeaders: false, 
    handler: (req, res, next, options) => {
        res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));
        res.status(429).json({
            error: 'Too many requests. Please try again in a minute.'
        });
    }
});
