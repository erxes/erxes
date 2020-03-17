import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';

// load environment variables
dotenv.config();

import { connect } from './connection';
import { debugInit } from './debuggers';
import './messageBroker';
import Logs from './models/Logs';

connect();

const app = express();

app.use((req: any, _res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk.toString().replace(/\//g, '/');
  });

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// sends logs according to specified filter
app.get('/logs', async (req, res) => {
  interface IFilter {
    createdAt?: any;
    createdBy?: string;
    action?: string;
    type?: string;
    description?: object;
  }

  const params = JSON.parse(req.body.params);
  const { start, end, userId, action, page, perPage, type, desc } = params;
  const filter: IFilter = {};

  // filter by date
  if (start && end) {
    filter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
  } else if (start) {
    filter.createdAt = { $gte: new Date(start) };
  } else if (end) {
    filter.createdAt = { $lte: new Date(end) };
  }

  // filter by user
  if (userId) {
    filter.createdBy = userId;
  }

  // filter by actions
  if (action) {
    filter.action = action;
  }

  // filter by module
  if (type) {
    filter.type = type;
  }

  // filter by description text
  if (desc) {
    filter.description = { $regex: desc, $options: '$i' };
  }

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  try {
    const logs = await Logs.find(filter)
      .sort({ createdAt: -1 })
      .limit(_limit)
      .skip((_page - 1) * _limit);

    const logsCount = await Logs.countDocuments(filter);

    return res.json({ logs, totalCount: logsCount });
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// for health checking
app.get('/status', async (_req, res) => {
  res.end('ok');
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

const { PORT } = process.env;

app.listen(PORT, () => {
  debugInit(`Logger server is running on port ${PORT}`);
});
