import * as connect_datadog from 'connect-datadog';
import ddTracer from 'dd-trace';

import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { filterXSS } from 'xss';
import { connect } from '../db/connection';
import { debugError, debugWorkers } from '../debuggers';
import { initMemoryStorage } from '../inmemoryStorage';
import userMiddleware from '../middlewares/userMiddleware';
import { initBroker } from './messageBroker';

// load environment variables
dotenv.config();

ddTracer.init({
  hostname: process.env.DD_HOST,
  logInjection: true
});

// connect to mongo database
connect();

const app = express();

const datadogMiddleware = connect_datadog({
  response_code: true,
  tags: ['workers']
});

app.use(datadogMiddleware);

app.disable('x-powered-by');

// for health check
app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

app.use(userMiddleware);

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);

  res.status(500).send(filterXSS(error.message));
});

const { PORT_WORKERS = 3700 } = process.env;

app.listen(PORT_WORKERS, () => {
  initMemoryStorage();

  initBroker(app).catch(e => {
    debugError(`Error ocurred during message broker init ${e.message}`);
  });

  debugWorkers(`Workers server is now running on ${PORT_WORKERS}`);
});
