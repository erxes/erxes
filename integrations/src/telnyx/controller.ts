import { debugRequest, debugTelnyx } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { createIntegration, sendSms, updateMessageDelivery } from './api';
import { relayIncomingMessage } from './store';

const processHookData = async req => {
  debugRequest(debugTelnyx, req);

  const { data } = req.body;

  await updateMessageDelivery(data);

  await relayIncomingMessage(data);
};

const init = async app => {
  app.post(
    '/telnyx/create-integration',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugTelnyx, req);

      await createIntegration(req.body);

      return res.json({ status: 'ok' });
    })
  );

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

  app.post(
    '/telnyx/send-sms',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugTelnyx, req);

      const { integrationId, content, to } = req.body;

      await sendSms(JSON.stringify({ integrationId, content, toPhone: to }));

      return res.json({ status: 'ok' });
    })
  );
};

export default init;
