import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from '../db/connection';
import { debugCrons } from '../debuggers';

import './activityLogs';
import './conversations';
import './deals';
import './engages';
import './integrations';
import './robot';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
});

const { PORT_CRONS = 3600 } = process.env;

app.listen(PORT_CRONS, () => {
  debugCrons(`Cron Server is now running on ${PORT_CRONS}`);
});
