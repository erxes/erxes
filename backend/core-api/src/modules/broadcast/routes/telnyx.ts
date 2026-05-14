import { Request, Response, Router } from 'express';

import { generateModels } from '~/connectionResolvers';
import { routeErrorHandling, saveTelnyxHookData } from '../utils';

const handleWebhookData = async (req: Request, res: Response) => {
  const { data, subdomain } = req.body;

  const models = await generateModels(subdomain);

  await saveTelnyxHookData(models, data);

  return res.json({ status: 'ok', data });
};

const router: Router = Router();

router.post(
  '/webhook',
  routeErrorHandling(async (req, res) => {
    return handleWebhookData(req, res);
  }),
);

// telnyx sends the same data here if url above fails
router.get(
  '/webhook-failover',
  routeErrorHandling(async (req, res) => {
    return handleWebhookData(req, res);
  }),
);

export { router };
