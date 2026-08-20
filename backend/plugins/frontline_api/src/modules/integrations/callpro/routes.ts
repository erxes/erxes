import express, { Router } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { receiveCallProEvent } from '@/integrations/callpro/controller';
import { debugCallProError } from '@/integrations/callpro/debuggers';

export const router: Router = express.Router();

router.post('/receive', async (req, res) => {
  try {
    await receiveCallProEvent(getSubdomain(req), req.body);
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
