import { debugPartnerStack, debugRequest } from '../debuggers';
import { createCustomer, createWebhook } from './utils';

const init = async app => {
  debugPartnerStack('partner stack init ');

  app.post('/partnerstack/webhook', async (req, res, next) => {
    try {
      const { email } = req.body;

      console.log(email);

      await createCustomer(email);
    } catch (e) {
      return next(e);
    }

    res.sendStatus(200);
  });

  app.post('/partnerStack/create-integration', async (req, res, next) => {
    debugRequest(debugPartnerStack, req);

    const { integrationId } = req.body;

    try {
      await createWebhook(integrationId);
    } catch (e) {
      next(e);
    }

    return res.json({ status: 'ok' });
  });
};

export default init;
