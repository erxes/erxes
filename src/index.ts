import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import initCallPro from './callpro/controller';
import initChatfuel from './chatfuel/controller';
import { connect } from './connection';
import { debugInit, debugIntegrations, debugRequest, debugResponse } from './debuggers';
import initFacebook from './facebook/controller';
import initGmail from './gmail/controller';
import { removeIntegration } from './helpers';
import './messageBroker';
import Accounts from './models/Accounts';
import initNylas from './nylas/controller';
import { init } from './startup';
import initTwitter from './twitter/controller';

// load environment variables
dotenv.config();

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

app.use(bodyParser.urlencoded({ limit: '10mb', verify: rawBodySaver, extended: true }));
app.use(bodyParser.json({ limit: '10mb', verify: rawBodySaver }));

// Intentionally placing this route above raw bodyParser
// File upload in nylas controller is not working with rawParser
initNylas(app);

app.use(bodyParser.raw({ limit: '10mb', verify: rawBodySaver, type: '*/*' }));

app.post('/integrations/remove', async (req, res) => {
  debugRequest(debugIntegrations, req);

  const { integrationId } = req.body;

  try {
    await removeIntegration(integrationId);
  } catch (e) {
    return res.json({ status: e.message });
  }

  debugResponse(debugIntegrations, req);

  return res.json({ status: 'ok' });
});

app.get('/accounts', async (req, res) => {
  debugRequest(debugIntegrations, req);

  let { kind } = req.query;

  if (kind.includes('nylas')) {
    kind = kind.split('-')[1];
  }

  const selector = { kind };

  const accounts = await Accounts.find(selector);

  debugResponse(debugIntegrations, req, JSON.stringify(accounts));

  return res.json(accounts);
});

// init bots
initFacebook(app);

// init gmail
initGmail(app);

// init callpro
initCallPro(app);

// init twitter
initTwitter(app);

// init chatfuel
initChatfuel(app);

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

const { PORT } = process.env;

app.listen(PORT, async () => {
  debugInit(`Integrations server is running on port ${PORT}`);

  // Initialize startup
  await init();
});
