import { getSubdomain } from '@erxes/api-utils/src/core';
import { getConfig } from './commonUtils';
import loginMiddleware from './middlewares/loginMiddleware';
import receiveMessage from './receiveMessage';
import { generateModels } from './connectionResolver';
import { getPageList } from './utils';
import {
  debugError,
  debugInstagram,
  debugRequest,
  debugResponse
} from './debuggers';

const init = async app => {
  app.get('/instagram/login', loginMiddleware);

  app.get('/instagram/get-accounts', async (req, res, next) => {
    debugRequest(debugInstagram, req);
    const accountId = req.query.accountId;
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const account = await models.Accounts.getAccount({
      _id: req.query.accountId
    });

    const accessToken = account.token;

    let pages: any[] = [];

    try {
      pages = await getPageList(models, accessToken);
    } catch (e) {
      if (!e.message.includes('Application request limit reached')) {
        await models.Integrations.updateOne(
          { accountId },
          {
            $set: {
              healthStatus: 'account-token',
              error: `${e.message}`
            }
          }
        );
      }

      debugError(`Error occured while connecting to facebook ${e.message}`);
      return next(e);
    }

    debugResponse(debugInstagram, req, JSON.stringify(pages));

    return res.json(pages);
  });

  app.get('/instagram/receive', async (req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const INSTAGRAM_VERIFY_TOKEN = await getConfig(
      models,
      'INSTAGRAM_VERIFY_TOKEN'
    );
    // when the endpoint is registered as a webhook, it must echo back
    // the 'hub.challenge' value it receives in the query arguments
    if (req.query['hub.mode'] === 'subscribe') {
      if (req.query['hub.verify_token'] === INSTAGRAM_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
      } else {
        res.send('OK');
      }
    }
  });
  app.post('/instagram/receive', async (req, res, next) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const data = req.body;
    if (data.object !== 'instagram') {
      return;
    }
    for (const entry of data.entry) {
      // receive chat
      if (entry.messaging[0]) {
        const messageData = entry.messaging[0];
        try {
          await receiveMessage(models, subdomain, messageData);

          return res.send('success');
        } catch (e) {
          return res.send('success');
        }
      }
    }

    next();
  });
};

export default init;
