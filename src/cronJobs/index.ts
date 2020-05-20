import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from '../db/connection';
import { debugCrons } from '../debuggers';

import { initRabbitMQ } from '../messageBroker';
import './activityLogs';
import './conversations';
import './deals';
import './engages';
import './integrations';
import './robot';

// load environment variables
dotenv.config();

const app = express();

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
});

const { PORT_CRONS = 3600 } = process.env;

app.listen(PORT_CRONS, () => {
  // connect to mongo database
  connect().then(async () => {
    initRabbitMQ();
  });

  debugCrons(`Cron Server is now running on ${PORT_CRONS}`);
});
