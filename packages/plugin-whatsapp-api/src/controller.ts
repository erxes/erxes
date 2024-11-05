import { getSubdomain } from '@erxes/api-utils/src/core';
import { getConfig } from './commonUtils';
import loginMiddleware from './middlewares/loginMiddleware';
import receiveMessage from './receiveMessage';
import { generateModels } from './connectionResolver';
import { getBusinessWhatsAppDetails } from './utils';
import { INTEGRATION_KINDS } from './constants';

import {
  debugError,
  debugWhatsapp,
  debugRequest,
  debugResponse
} from './debuggers';

const init = async (app) => {
  app.get('/login', loginMiddleware);

  // app.get('/whatsapp/get-accounts', async (req, res, next) => {
  //   debugRequest(debugWhatsapp, req);
  //   const accountId = req.query.accountId;
  //   const subdomain = getSubdomain(req);
  //   const models = await generateModels(subdomain);
  //   const account = await models.Accounts.getAccount({
  //     _id: req.query.accountId
  //   });

  //   const accessToken = account.token;

  //   let pages: any[] = [];

  //   try {
  //     pages = await getBusinessWhatsAppDetails(models, accessToken, kind);
  //   } catch (e) {
  //     if (!e.message.includes('Application request limit reached')) {
  //       await models.Integrations.updateOne(
  //         { accountId },
  //         {
  //           $set: {
  //             healthStatus: 'account-token',
  //             error: `${e.message}`
  //           }
  //         }
  //       );
  //     }

  //     debugError(`Error occured while connecting to facebook ${e.message}`);
  //     return next(e);
  //   }

  //   debugResponse(debugWhatsapp, req, JSON.stringify(pages));

  //   return res.json(pages);
  // });

  app.get('/whatsapp/receive', async (req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const WHATSAPP_VERIFY_TOKEN = await getConfig(
      models,
      'WHATSAPP_VERIFY_TOKEN'
    );
    // when the endpoint is registered as a webhook, it must echo back
    // the 'hub.challenge' value it receives in the query arguments
    if (req.query['hub.mode'] === 'subscribe') {
      if (req.query['hub.verify_token'] === WHATSAPP_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
      } else {
        res.send('OK');
      }
    }
  });
  app.post('/whatsapp/receive', async (req, res, next) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const data = req.body;
    if (data.object !== 'whatsapp_business_account') {
      return;
    }
    for (const entry of data.entry) {
      console.log(entry, 'entry');
      // receive chat
      if (entry.changes) {
        for (const event of entry.changes) {
          console.log(event.field, 'event.field');
          if (event.field === 'messages') {
            debugWhatsapp(
              `Received message data ${JSON.stringify(event.value)}`
            );
            try {
              await receiveMessage(models, subdomain, event.value);
              debugWhatsapp(
                `Successfully saved  ${JSON.stringify(event.value)}`
              );
              return res.end('success');
            } catch (e) {
              debugError(`Error processing message: ${e.message}`);
              return res.end('success');
            }
          }
        }
      }
    }
  });
};

export default init;
