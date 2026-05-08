import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginMiddleware } from '@/integrations/instagram/middleware/loginMiddleware';
import {
  instagramGetPost,
  instagramGetStatus,
  instagramSubscription,
  instagramWebhook,
} from '@/integrations/instagram/controller/controller';

export const router: Router = express.Router();

const instagramLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
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
