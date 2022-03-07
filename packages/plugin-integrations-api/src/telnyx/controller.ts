import { debugRequest, debugTelnyx } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import {
  createIntegration,
  getSmsDeliveries,
  updateMessageDelivery
} from './api';
import { relayIncomingMessage } from './store';

const processHookData = async req => {
  debugRequest(debugTelnyx, req);

  const { data } = req.body;

  await updateMessageDelivery(data);

  await relayIncomingMessage(data);
};

export const telnyxCreateIntegration = async (doc) => {
  await createIntegration(doc);

  return { status: 'ok' };
} 

const init = async app => {
  // receive sms hook
  app.post(
    '/telnyx/webhook',
    routeErrorHandling(async (req, res) => {
      await processHookData(req);

      return res.json({ status: 'ok' });
    })
  );

  app.post(
    '/telnyx/webhook-failover',
    routeErrorHandling(async (req, res) => {
      await processHookData(req);

      return res.json({ status: 'ok' });
    })
  );

  // sms delivery reports
  app.get(
    '/telnyx/sms-deliveries',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugTelnyx, req);

      const { type, to, page = 1, perPage = 20 } = req.query;

      try {
        const result = await getSmsDeliveries({ type, to, page, perPage });

        return res.json(result);
      } catch (e) {
        return res.json({ status: 'error', message: e.message });
      }
    })
  );
};

export default init;
