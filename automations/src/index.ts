import * as bodyParser from 'body-parser';
import * as express from 'express';
import { filterXSS } from 'xss';
import { connect } from './connection';
import { debugBase, debugError, debugInit } from './debuggers';
import { initBroker } from "./messageBroker";
import controllers from './controllers';

export const app = express();

app.disable('x-powered-by');

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

app.use('/api', controllers);

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

  debugInit(`Automations server is running on port ${PORT}`);
});
