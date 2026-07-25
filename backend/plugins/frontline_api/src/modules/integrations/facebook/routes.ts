import express, { Request, Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { loginMiddleware } from '@/integrations/facebook/middlewares/loginMiddleware';
import {
  facebookGetPost,
  facebookGetStatus,
  facebookSubscription,
  facebookWebhook,
} from '@/integrations/facebook/controller/controller';
export const router: Router = express.Router();

/**
 * Pick the rightmost X-Forwarded-For hop (the last trusted proxy in the chain),
 * matching the pattern used by core-api/fileRoutes and core-api/main. The
 * leftmost XFF entry is attacker-controllable, so we never trust it.
 */
const getClientIp = (req: Request): string => {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const parts = (Array.isArray(xff) ? xff[0] : xff).split(',');
    return parts[parts.length - 1].trim();
  }
  return req.ip || 'unknown';
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  // Per OWASP guidance, don't count successful auth flows toward the limit;
  // we only want to slow down repeated failures / probing.
  skipSuccessfulRequests: true,
  keyGenerator: (req) => ipKeyGenerator(getClientIp(req)),
  handler: (_req, res) => {
    res.status(429).json({
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login requests, please try again later.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Facebook routes
router.get('/fblogin', loginLimiter, loginMiddleware);

router.get('/get-post', async (req, res, next) => {
  try {
    await facebookGetPost(req, res, next);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get post',
      error: err.message || err.toString(),
    });
  }
});

router.get('/get-status', async (req, res, next) => {
  try {
    await facebookGetStatus(req, res, next);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: err.message || err.toString(),
    });
  }
});

router.get('/receive', async (req, res, next) => {
  try {
    await facebookSubscription(req, res, next);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Subscription failed',
      error: err.message || err.toString(),
    });
  }
});

router.post('/receive', async (req, res, next) => {
  try {
    await facebookWebhook(req, res, next);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Webhook handling failed',
      error: err.message || err.toString(),
    });
  }
});
