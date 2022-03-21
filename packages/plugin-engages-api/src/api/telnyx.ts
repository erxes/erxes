import { Router } from 'express';

import { generateModels } from '../connectionResolver';
import { debugEngages, debugRequest } from '../debuggers';
import { saveTelnyxHookData } from '../telnyxUtils';
import { routeErrorHandling } from '../utils';

const handleWebhookData = async (req, res) => {
  debugRequest(debugEngages, req);

  const { data, subdomain } = req.body;

  const models = await generateModels(subdomain);

  await saveTelnyxHookData(models, data);

  return res.json({ status: 'ok', data });
};

const router = Router();

router.post(
  '/webhook',
  routeErrorHandling(async (req, res) => {
    return handleWebhookData(req, res);
  })
);

// telnyx sends the same data here if url above fails
router.get(
  '/webhook-failover',
  routeErrorHandling(async (req, res) => {
    return handleWebhookData(req, res);
  })
);

export default router;
