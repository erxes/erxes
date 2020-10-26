import { Router } from 'express';
import { debugEngages, debugRequest } from '../debuggers';
import { saveTelnyxHookData } from '../telnyxUtils';

const handleWebhookData = async (req, res) => {
  debugRequest(debugEngages, req);

  const { data } = req.body;

  await saveTelnyxHookData(data);

  return res.json({ status: 'ok', data });
};

const router = Router();

router.post('/webhook', async (req, res) => {
  return handleWebhookData(req, res);
});

// telnyx sends the same data here if url above fails
router.get('/webhook-failover', async (req, res) => {
  return handleWebhookData(req, res);
});

export default router;
