import { debugResponse, debugSmooch } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { createIntegration, reply } from './api';

import receiveMessage from './receiveMessage';

export const smoochCreateIntegration = async (doc) => {
  await createIntegration(doc);

  return { status: 'ok' };
}

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
    '/smooch/reply',
    routeErrorHandling(async (req, res) => {
      await reply(req.body);

      debugResponse(debugSmooch, req);

      res.sendStatus(200);
    })
  );
};

export default init;
