import express, { Router } from 'express';
import { loginMiddleware } from '@/integrations/instagram/middlewares/loginMiddleware';
import {
  instagramGetPost,
  instagramGetStatus,
  instagramSubscription,
  instagramWebhook,
} from '@/integrations/instagram/controller/controller';
export const router: Router = express.Router();

// Facebook routes
router.get('/fblogin', loginMiddleware);

router.get('/get-post', async (req, res, next) => {
  try {
    await instagramGetPost(req, res, next);
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
    await instagramGetStatus(req, res, next);
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
    await instagramSubscription(req, res, next);
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
    await instagramWebhook(req, res, next);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Webhook handling failed',
      error: err.message || err.toString(),
    });
  }
});
