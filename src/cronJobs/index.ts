import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from '../db/connection';
import { debugCrons, debugRequest, debugResponse } from '../debuggers';

import './activityLogs';
import './conversations';
import './deals';
import { createSchedule, updateOrRemoveSchedule } from './engages';
import './integrations';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/create-schedule', async (req, res, next) => {
  debugRequest(debugCrons, req);

  const { message } = req.body;

  try {
    await createSchedule(JSON.parse(message));
  } catch (e) {
    debugCrons(`Error while proccessing createSchedule ${e.message}`);
    return next(e);
  }

  debugResponse(debugCrons, req);

  return res.json({ status: 'ok ' });
});

app.post('/update-or-remove-schedule', async (req, res, next) => {
  debugRequest(debugCrons, req);

  const { _id, update } = req.body;

  try {
    await updateOrRemoveSchedule(_id, update);
  } catch (e) {
    debugCrons(`Error while proccessing createSchedule ${e.message}`);
    return next(e);
  }

  debugResponse(debugCrons, req);

  return res.json({ status: 'ok ' });
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

const { PORT_CRONS } = process.env;

app.listen(PORT_CRONS, () => {
  debugCrons(`Cron Server is now running on ${PORT_CRONS}`);
});
