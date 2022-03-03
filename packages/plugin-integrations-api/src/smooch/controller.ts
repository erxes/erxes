import { debugRequest, debugResponse, debugSmooch } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { createIntegration, reply } from './api';

import receiveMessage from './receiveMessage';

const init = async app => {
  app.post(
    '/smooch/webhook',
    routeErrorHandling(async (req, res) => {
      debugSmooch('Received new message in smooch...');

      await receiveMessage(req.body);

      return res.status(200).send('success');
    })
  );

  app.post(
    '/smooch/create-integration',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugSmooch, req);

      await createIntegration(req.body);

      return res.json({ status: 'ok' });
    })
  );

  app.post(
    '/smooch/reply',
    routeErrorHandling(async (req, res) => {
      await reply(req.body);

      debugResponse(debugSmooch, req);

      res.sendStatus(200);
    })
  );
};

export default init;
