import * as request from 'request-promise';
import { debugPartnerStack, debugRequest } from '../debuggers';
import { Integrations } from '../models';
import { getConfig, getEnv } from '../utils';

const init = async app => {
  app.post('/webhook/create-integration', async (req, res, next) => {
    debugRequest(debugPartnerStack, req);

    const { integrationId } = req.body;

    let integration = await Integrations.findOne({
      $and: [{ erxesApiId: integrationId }, { kind: 'partnerStack' }]
    });

    if (integration) {
      throw new Error('Integration has already been created');
    }

    const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });

    const webhookUrl = `${MAIN_API_DOMAIN}/webhooks/${integrationId}`;

    console.log('webhookUrl: ', webhookUrl);
    const password = await getConfig('PARTNER_STACK_SECRET_KEY');

    if (!password) {
      throw new Error('Partner Stack Secret Key is not configured');
    }

    const username = await getConfig('PARTNER_STACK_KEY');

    if (!username) {
      throw new Error('Partner Stack Public Key is not configured');
    }

    const auth =
      'Basic ' + Buffer.from(username + ':' + password).toString('base64');

    const options = {
      uri: 'https://api.partnerstack.com/v1/webhooks',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: auth
      },
      body: {
        event: 'partnership_created',
        target_url: webhookUrl
      },
      json: true
    };

    try {
      const { rdata } = await request(options);
      const { key } = rdata;

      integration = await Integrations.create({
        kind: 'partnerStack',
        erxesApiId: integrationId,
        partnerStackKey: key
      });
    } catch (e) {
      console.log('sda aldaa: ', e.message);
      await Integrations.deleteOne({ _id: integration.id });

      return next('sda error chachlaa: ', e.message);
    }

    return res.json({ status: 'ok' });
  });
};

export default init;
