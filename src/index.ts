import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';

// load environment variables
dotenv.config();

import initCallPro from './callpro/controller';
import { connect } from './connection';
import { debugInit, debugIntegrations, debugRequest, debugResponse } from './debuggers';
import initFacebook from './facebook/controller';
import { getPageAccessToken, unsubscribePage } from './facebook/utils';
import initGmail from './gmail/controller';
import { getCredentialsByEmailAccountId } from './gmail/util';
import { stopPushNotification } from './gmail/watch';
import './messageQueue';
import Accounts from './models/Accounts';
import Integrations from './models/Integrations';
import { init } from './startup';

connect();

const app = express();

const rawBodySaver = (req, _res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');

    if (req.headers.fromcore === 'true') {
      req.rawBody = req.rawBody.replace(/\//g, '\\/');
    }
  }
};

app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.json({ limit: '10mb', verify: rawBodySaver }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));

app.post('/integrations/remove', async (req, res) => {
  debugRequest(debugIntegrations, req);

  const { integrationId } = req.body;

  const integration = await Integrations.findOne({ erxesApiId: integrationId });

  if (!integration) {
    return res.status(500).send('Integration not found');
  }

  const account = await Accounts.findOne({ _id: integration.accountId });

  if (integration.kind === 'facebook' && account) {
    for (const pageId of integration.facebookPageIds) {
      const pageTokenResponse = await getPageAccessToken(pageId, account.token);

      await unsubscribePage(pageId, pageTokenResponse);
    }
  }

  if (integration.kind === 'gmail' && account) {
    const credentials = await getCredentialsByEmailAccountId({ email: account.uid });

    await stopPushNotification(account.uid, credentials);
  }

  await Integrations.deleteOne({ erxesApiId: integrationId });

  debugResponse(debugIntegrations, req);

  return res.json({ status: 'ok ' });
});

app.get('/accounts', async (req, res) => {
  debugRequest(debugIntegrations, req);

  const accounts = await Accounts.find({ kind: req.query.kind });

  debugResponse(debugIntegrations, req, JSON.stringify(accounts));

  return res.json(accounts);
});

app.post('/accounts/remove', async (req, res) => {
  debugRequest(debugIntegrations, req);

  await Accounts.deleteOne({ _id: req.body._id });

  debugResponse(debugIntegrations, req);

  return res.json({ status: 'removed' });
});

// init bots
initFacebook(app);

// init gmail
initGmail(app);

// init callpro
initCallPro(app);

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

const { PORT } = process.env;

app.listen(PORT, () => {
  debugInit(`Integrations server is running on port ${PORT}`);

  // Initialize startup
  init();
});
