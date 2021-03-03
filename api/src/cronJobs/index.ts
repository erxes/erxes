import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from '../db/connection';
import { debugCrons, debugError } from '../debuggers';

import { initMemoryStorage } from '../inmemoryStorage';
import { initBroker } from '../messageBroker';
import './activityLogs';
import './conversations';
import './deals';
import './engages';
import './integrations';
import './notificatons';
import './robot';

// load environment variables
dotenv.config();

const app = express();

// for health check
app.get('/health', async (_req, res) => {
  res.end('ok');
});

const { PORT_CRONS = 3600 } = process.env;

app.listen(PORT_CRONS, () => {
  // connect to mongo database
  connect().then(async () => {
    initMemoryStorage();

    initBroker(app).catch(e => {
      debugError(`Error ocurred during broker init ${e.message}`);
    });
  });

  debugCrons(`Cron Server is now running on ${PORT_CRONS}`);
});
