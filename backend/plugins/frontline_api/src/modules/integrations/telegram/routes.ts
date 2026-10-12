import { Router } from 'express';
import { ZodError } from 'zod';
import { authenticateTelegramWebhook } from '@/integrations/telegram/middleware/authenticateWebhook';
import { telegramWebhook } from '@/integrations/telegram/controller/webhook';

export const router: Router = Router();

router.post('/receive/:_id', authenticateTelegramWebhook, async (req, res) => {
  try {
    await telegramWebhook(req, res);
  } catch (error: unknown) {
    res.sendStatus(error instanceof ZodError ? 400 : 500);
  }
});
