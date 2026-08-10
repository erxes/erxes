import express, { Router } from 'express';
import {
  whatsappSubscription,
  whatsappWebhook,
} from '@/integrations/whatsapp/controller/controller';

export const router: Router = express.Router();

/**
 * Both verbs live on the same path because Meta uses one callback URL for
 * both: GET performs the one-time subscription handshake, POST delivers
 * events.
 */
router.get('/receive', async (req, res, next) => {
  try {
    await whatsappSubscription(req, res, next);
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
    await whatsappWebhook(req, res, next);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Webhook handling failed',
      error: err.message || err.toString(),
    });
  }
});
