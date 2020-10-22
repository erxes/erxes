import { debugRequest, debugResponse, debugSmooch } from '../debuggers';
import { createIntegration, reply } from './api';

import receiveMessage from './receiveMessage';

const init = async app => {
  app.post('/smooch/webhook', async (req, res, next) => {
    debugSmooch('Received new message in smooch...');

    try {
      await receiveMessage(req.body);
    } catch (e) {
      return next(e);
    }

    return res.status(200).send('success');
  });

  app.post('/smooch/create-integration', async (req, res, next) => {
    debugRequest(debugSmooch, req);

    try {
      await createIntegration(req.body);
    } catch (e) {
      return next(e);
    }

    return res.json({ status: 'ok' });
  });

  app.post('/smooch/reply', async (req, res, next) => {
    try {
      await reply(req.body);
    } catch (e) {
      next(e);
    }

    debugResponse(debugSmooch, req);

    res.sendStatus(200);
  });
};

export default init;
