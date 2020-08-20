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
import { debugBase, debugInit } from './debuggers';
import { initBroker } from './messageBroker';
import { trackEngages } from './trackers/engageTracker';

const app = express();

app.disable('x-powered-by');
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

trackEngages(app);

// Error handling middleware
app.use((error, _req, res, _next) => {
  const msg = filterXSS(error.message);

  debugBase(`Error: `, msg);
  res.status(500).send(msg);
});

const { PORT } = process.env;

app.listen(PORT, () => {
  // connect to mongo database
  connect().then(async () => {
    initBroker(app).catch(e => {
      debugBase(`Error ocurred during message broker init ${e.message}`);
    });
  });

  debugInit(`Engages server is running on port ${PORT}`);
});
