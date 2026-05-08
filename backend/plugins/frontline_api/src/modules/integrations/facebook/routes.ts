import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginMiddleware } from '@/integrations/facebook/middlewares/loginMiddleware';
import {
  facebookGetPost,
  facebookGetStatus,
  facebookSubscription,
  facebookWebhook,
} from '@/integrations/facebook/controller/controller';
export const router: Router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errorCode: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many login requests, please try again later.',
  },
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
