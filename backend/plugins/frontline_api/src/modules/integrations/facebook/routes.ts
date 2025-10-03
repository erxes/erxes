import express, { Router } from 'express';
import { loginMiddleware } from '@/integrations/facebook/middlewares/loginMiddleware';
import {
  facebookGetPost,
  facebookGetStatus,
  facebookSubscription,
  facebookWebhook,
} from '@/integrations/facebook/controller/controller';
export const router: Router = express.Router();

// Facebook routes
router.get('/fblogin', async (req, res) => {
  try {
    await loginMiddleware(req, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message || err.toString(),
    });
  }
});

router.get('/get-post', async (req, res) => {
  try {
    await facebookGetPost(req, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get post',
      error: err.message || err.toString(),
    });
  }
});

router.get('/get-status', async (req, res) => {
  try {
    await facebookGetStatus(req, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: err.message || err.toString(),
    });
  }
});

router.get('/receive', async (req, res) => {
  try {
    await facebookSubscription(req, res);
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
