import { Router } from 'express';
import { debugEngages, debugRequest } from '../debuggers';
import { saveTelnyxHookData } from '../telnyxUtils';

const router = Router();

router.post('/webhook', async (req, res) => {
  debugRequest(debugEngages, req);

  const { data } = req.body;

  await saveTelnyxHookData(data);

  return res.json({ status: 'ok' });
});

// telnyx sends the same data here if url above fails
router.get('/webhook-failover', async (req, res) => {
  debugRequest(debugEngages, req);

  const { data } = req.body;

  await saveTelnyxHookData(data);

  return res.json({ status: 'ok' });
});

export default router;
