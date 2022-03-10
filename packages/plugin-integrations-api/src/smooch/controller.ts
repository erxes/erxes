import { debugSmooch } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { createIntegration, reply } from './api';

import receiveMessage from './receiveMessage';

export const smoothReply = async (doc) => {
  await reply(doc);

  return 'success'
}

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
};

export default init;
