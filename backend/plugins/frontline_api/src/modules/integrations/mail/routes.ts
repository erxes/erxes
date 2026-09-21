import express, { Router } from 'express';
import { receiveMailMessage } from '@/integrations/mail/controller/receiveMessage';
import { debugError } from '@/integrations/mail/debuggers';

export const router: Router = express.Router();

router.post('/receive', async (req, res) => {
  try {
    await receiveMailMessage(req, res);
  } catch (err) {
    debugError('Failed to handle inbound message:', err);

    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to handle inbound message' });
    }
  }
});
