import { Router, type Response } from 'express';
import type { IViberWebhookRequest } from '@/integrations/viber/@types/webhook';
import { receiveViberMessage } from '@/integrations/viber/controller/receiveMessage';
import { debugError } from '@/integrations/viber/debuggers';
import { serveViberOutboundMedia } from '@/integrations/viber/controller/outboundMedia';

export const router: Router = Router();

router.get(
  '/receive/:integrationId/media/:messageId/:index/:name',
  async (req, res): Promise<void> => {
    try {
      await serveViberOutboundMedia(req, res);
    } catch {
      debugError('Failed to serve Viber attachment');
      if (!res.headersSent) res.sendStatus(500);
    }
  },
);

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
