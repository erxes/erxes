import express, { Router } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { receiveCallProEvent } from '@/integrations/callpro/controller';
import {
  debugCallPro,
  debugCallProError,
} from '@/integrations/callpro/debuggers';

export const router: Router = express.Router();

router.post('/receive', async (req, res) => {
  debugCallPro('POST /callpro/receive', JSON.stringify(req.body));

  try {
    await receiveCallProEvent(getSubdomain(req), req.body);
    debugCallPro(`Event handled callID=${req.body?.callID}`);
    res.send('success');
  } catch (err) {
    debugCallProError('Failed to handle Call Pro event', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to receive Call Pro event',
      error: err.message || err.toString(),
    });
  }
});
