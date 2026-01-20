import express, { Router } from 'express';
import loginMiddleware from './middleware/loginMiddleware';
import {
  instagramGetAccounts,
  instagramSubscription,
  instagramWebhook,
} from './controller/controller';

export const router: Router = express.Router();

// Instagram routes

router.get('/iglogin', loginMiddleware);

router.get('/get-accounts', async (req, res, next) => {
  try {
    await instagramGetAccounts(req, res, next);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get accounts',
      error: err.message || err.toString(),
    });
  }
});

router.get('/receive', async (req, res) => {
  try {
    await instagramSubscription(req, res);
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
    await instagramWebhook(req, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Webhook handling failed',
      error: err.message || err.toString(),
    });
  }
});