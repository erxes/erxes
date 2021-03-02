import * as bodyParser from 'body-parser';
import * as express from 'express';

import initCallPro from './callpro/controller';
import initChatfuel from './chatfuel/controller';
import { connect, mongoStatus } from './connection';
import {
  debugInit,
  debugIntegrations,
  debugRequest,
  debugResponse
} from './debuggers';
import initFacebook from './facebook/controller';
import initGmail from './gmail/controller';
import {
  removeIntegration,
  routeErrorHandling,
  updateIntegrationConfigs
} from './helpers';
import { initMemoryStorage } from './inmemoryStorage';
import { initBroker } from './messageBroker';
import { Accounts, Configs, Integrations } from './models/index';
import { initNylas } from './nylas/controller';
import initProductBoard from './productBoard/controller';
import initSmooch from './smooch/controller';
import { init } from './startup';
import systemStatus from './systemStatus';
import initTelnyx from './telnyx/controller';
import initTwitter from './twitter/controller';
import userMiddleware from './userMiddleware';
import initDaily from './videoCall/controller';
import initWhatsapp from './whatsapp/controller';

const app = express();

const rawBodySaver = (req, _res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');

    if (req.headers.fromcore === 'true') {
      req.rawBody = req.rawBody.replace(/\//g, '\\/');
    }
  }
};

app.use(
  bodyParser.urlencoded({ limit: '10mb', verify: rawBodySaver, extended: true })
);
app.use(bodyParser.json({ limit: '10mb', verify: rawBodySaver }));

app.use(userMiddleware);

// Intentionally placing this route above raw bodyParser
// File upload in nylas controller is not working with rawParser
initNylas(app);

app.use(bodyParser.raw({ limit: '10mb', verify: rawBodySaver, type: '*/*' }));

app.use((req, _res, next) => {
  debugRequest(debugIntegrations, req);

  next();
});

// for health check
app.get('/health', async (_req, res, next) => {
  try {
    await mongoStatus();
  } catch (e) {
    debugIntegrations('MongoDB is not running');
    return next(e);
  }
  res.end('ok');
});

app.get('/system-status', async (_req, res) => {
  return res.json(await systemStatus());
});

app.post(
  '/update-configs',
  routeErrorHandling(async (req, res) => {
    const { configsMap } = req.body;

    await updateIntegrationConfigs(configsMap);

    debugResponse(debugIntegrations, req);

    return res.json({ status: 'ok' });
  })
);

app.get('/configs', async (req, res) => {
  const configs = await Configs.find({});

  debugResponse(debugIntegrations, req, JSON.stringify(configs));

  return res.json(configs);
});

app.post(
  '/integrations/remove',
  routeErrorHandling(
    async (req, res) => {
      const { integrationId } = req.body;

      await removeIntegration(integrationId);

      debugResponse(debugIntegrations, req);

      return res.json({ status: 'ok' });
    },
    (res, e) => res.json({ status: e.message })
  )
);

app.get('/accounts', async (req, res) => {
  let { kind } = req.query;

  if (kind.includes('nylas')) {
    kind = kind.split('-')[1];
  }

  const selector = { kind };

  const accounts = await Accounts.find(selector);

  debugResponse(debugIntegrations, req, JSON.stringify(accounts));

  return res.json(accounts);
});

app.get('/integrations', async (req, res) => {
  const { kind } = req.query;

  const integrations = await Integrations.find({ kind });

  debugResponse(debugIntegrations, req, JSON.stringify(integrations));

  return res.json(integrations);
});

app.get('/integrationDetail', async (req, res) => {
  const { erxesApiId } = req.query;

  const integration = await Integrations.findOne({ erxesApiId });

  debugResponse(debugIntegrations, req, JSON.stringify(integration));

  return res.json(integration);
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

// init whatsapp
initWhatsapp(app);

// init chatfuel
initDaily(app);

// init smooch
initSmooch(app);

// init product board
initProductBoard(app);

// init telnyx
initTelnyx(app);

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

const { PORT } = process.env;

app.listen(PORT, () => {
  connect().then(async () => {
    await initBroker(app);

    initMemoryStorage();

    // Initialize startup
    init();
  });

  debugInit(`Integrations server is running on port ${PORT}`);
});
