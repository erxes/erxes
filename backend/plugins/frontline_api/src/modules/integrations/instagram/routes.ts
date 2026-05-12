import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from 'erxes-api-shared/utils';
import { loginMiddleware } from '@/integrations/instagram/middleware/loginMiddleware';
import {
  instagramGetPost,
  instagramGetStatus,
  instagramSubscription,
  instagramWebhook,
} from '@/integrations/instagram/controller/controller';

export const router: Router = express.Router();

// Redis-backed store: counter is shared across all frontline_api instances
// via the erxes-api-shared ioredis singleton, so the 150-req cap applies
// cluster-wide and cannot be bypassed by load-balancing across replicas.
const instagramLoginLimiter = rateLimit({
  store: new RedisStore({
    prefix: 'rl:ig-login:',
    // ioredis `call(...args)` requires the first element to be typed as
    // `command: string`; type the parameter as a tuple so we no longer need
    // an `as [string, ...string[]]` cast. The `as Promise<any>` remains
    // because ioredis returns `Promise<unknown>` while rate-limit-redis'
    // SendCommandFn expects `Promise<RedisReply>`.
    sendCommand: (...args: [string, ...string[]]) =>
      redis.call(...args) as Promise<any>,
  }),
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  // Fail open if Redis is unreachable so an outage doesn't take OAuth login
  // down. Trade-off: an attacker who can also degrade Redis could bypass the
  // limit; we accept this because the cost of OAuth login being down for all
  // users during a Redis incident is higher than the residual abuse risk.
  // Log a security event when this happens so operators can correlate
  // Redis-outage windows with traffic spikes on /iglogin.
  skip: (req) => {
    const skipForRedisOutage = redis.status !== 'ready';
    if (skipForRedisOutage) {
      console.error(
        `[SECURITY] Instagram /iglogin rate limit bypassed: Redis status=${redis.status} ip=${req.ip}`,
      );
    }
    return skipForRedisOutage;
  },
  handler: (_req, res) => {
    res.status(429).json({
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message:
        'Too many Instagram OAuth requests, please try again in a few minutes.',
    });
  },
});

router.get('/iglogin', instagramLoginLimiter, loginMiddleware);
router.get('/get-post', instagramGetPost);
router.get('/get-status', instagramGetStatus);
router.get('/receive', instagramSubscription);
router.post('/receive', instagramWebhook);
