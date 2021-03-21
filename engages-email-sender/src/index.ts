import * as connect_datadog from 'connect-datadog';
import ddTracer from 'dd-trace';

import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { filterXSS } from 'xss';
import configs from './api/configs';
import deliveryReports from './api/deliveryReports';
import telnyx from './api/telnyx';

// load environment variables
dotenv.config();

import { connect } from './connection';
import { debugBase, debugError, debugInit } from './debuggers';
import { initBroker } from './messageBroker';
import { trackEngages } from './trackers/engageTracker';

ddTracer.init({
  hostname: process.env.DD_HOST,
  logInjection: true
});

export const app = express();

const datadogMiddleware = connect_datadog({
  response_code: true,
  tags: ['engages']
});

app.use(datadogMiddleware);

app.disable('x-powered-by');

trackEngages(app);

// for health checking
app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.use((req: any, _res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk.toString().replace(/\//g, '/');
  });

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Insert routes below
app.use('/configs', configs);
app.use('/deliveryReports', deliveryReports);
app.use('/telnyx', telnyx);

// Error handling middleware
app.use((error, _req, res, _next) => {
  const msg = filterXSS(error.message);

  debugBase(`Error: ${msg}`);
  res.status(500).send(msg);
});

const { MONGO_URL, NODE_ENV, PORT, TEST_MONGO_URL } = process.env;

app.listen(PORT, () => {
  let mongoUrl = MONGO_URL;

  if (NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
  }

  // connect to mongo database
  connect(mongoUrl).then(async () => {
    initBroker(app).catch(e => {
      debugError(`Error ocurred during message broker init ${e.message}`);
    });
  });

  debugInit(`Engages server is running on port ${PORT}`);
});
