import { Router } from 'express';
import { debugEngages, debugRequest } from '../debuggers';
import { getSmsDeliveries, saveTelnyxHookData } from '../telnyxUtils';
import { routeErrorHandling } from '../utils';

const handleWebhookData = async (req, res) => {
  debugRequest(debugEngages, req);

  const { data } = req.body;

  await saveTelnyxHookData(data);

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

// sms delivery reports
router.get(
  '/sms-deliveries',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { type, to, page = 1, perPage = 20 } = req.query;

    try {
      const result = await getSmsDeliveries({ type, to, page, perPage });

      return res.json(result);
    } catch (e) {
      return res.json({ status: 'error', message: e.message });
    }
  })
);

export default router;
