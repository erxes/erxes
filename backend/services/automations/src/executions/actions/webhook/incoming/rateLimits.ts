import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request } from 'express';

// Rate limit for webhooks (per IP + webhook ID)
export const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'Too many webhook requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request) => {
    // Use IPv6-safe helper instead of req.ip
    const ip = ipKeyGenerator(
      req.ip || req.connection.remoteAddress || 'unknown',
    );
    const id = req.params.id || '';
    return `${ip}-${id}`;
  },
});

// Rate limit for continuation calls (per IP + execution ID)
export const continueRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: 'Too many requests, try later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = ipKeyGenerator(
      req.ip || req.connection.remoteAddress || 'unknown',
    );
    const executionId = req.params.executionId || '';
    return `${ip}-${executionId}`;
  },
});
