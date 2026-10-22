import { Router } from 'express';
import {
  receiveWhatsappWebhook,
  verifyWhatsappWebhook,
} from '@/integrations/whatsapp/controller/webhook';

export const router: Router = Router();

router.get('/receive', async (req, res) => {
  try {
    await verifyWhatsappWebhook(req, res);
  } catch {
    res.sendStatus(500);
  }
});

router.post('/receive', async (req, res) => {
  try {
    await receiveWhatsappWebhook(req, res);
  } catch {
    res.sendStatus(500);
  }
});
