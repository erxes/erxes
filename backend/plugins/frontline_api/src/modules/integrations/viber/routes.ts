import { Router, type Response } from 'express';
import type { IViberWebhookRequest } from '@/integrations/viber/@types/webhook';
import { receiveViberMessage } from '@/integrations/viber/controller/receiveMessage';
import { debugError } from '@/integrations/viber/debuggers';

export const router: Router = Router();

router.post(
  '/receive/:integrationId',
  async (req: IViberWebhookRequest, res: Response<unknown>): Promise<void> => {
    try {
      await receiveViberMessage(req, res);
    } catch {
      debugError('Failed to handle Viber webhook');

      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to handle Viber webhook',
        });
      }
    }
  },
);
