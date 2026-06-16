import express, { Router } from 'express';
import {
  whatsappGetStatus,
  whatsappSubscription,
  whatsappWebhook,
} from '@/integrations/whatsapp/controller/controller';

export const router: Router = express.Router();

router.get('/get-status', whatsappGetStatus);
router.get('/receive', whatsappSubscription);
router.post('/receive', whatsappWebhook);
