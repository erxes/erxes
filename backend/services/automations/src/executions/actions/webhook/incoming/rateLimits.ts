import rateLimit from 'express-rate-limit';

export const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many webhook requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.ip + req.params.id; // Rate limit per IP per webhook ID
  },
});

export const continueRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // tune to your needs
  message: { success: false, message: 'Too many requests, try later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // per-execution per-ip
    const executionId = req.params.executionId || '';
    return `${req.ip}:${executionId}`;
  },
});
