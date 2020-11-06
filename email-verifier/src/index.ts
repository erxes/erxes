import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { filterXSS } from 'xss';
import { bulk, single } from './api';
import { validateBulkPhones, validateSinglePhone } from './apiPhoneVerifier';
import { connect } from './connection';
import './cronJobs/verifier';
import { initRedis } from './redisClient';
import { debugBase, debugCrons, debugRequest } from './utils';

// load environment variables
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/verify-single', async (req, res, next) => {
  debugRequest(debugBase, req);

  console.log(req.headers);

  const { email, phone, hostname } = req.body;

  if (email) {
    try {
      const result = await single(email, hostname);

      return res.json(result);
    } catch (e) {
      return next(new Error(e));
    }
  }

  try {
    const result = await validateSinglePhone(phone, hostname);

    return res.json(result);
  } catch (e) {
    return next(new Error(e));
  }
});

app.post('/verify-bulk', async (req, res, next) => {
  debugRequest(debugBase, req);

  const { phones, emails, hostname } = req.body;

  if (phones) {
    try {
      const result = await validateBulkPhones(phones, hostname);

      return res.json({ phones: result });
    } catch (e) {
      return next(e);
    }
  }

  try {
    const result = await bulk(emails, hostname);
    return res.json({ emails: result });
  } catch (e) {
    return next(e);
  }
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  const msg = filterXSS(error.message);

  debugBase(`Error: `, msg);
  res.status(500).send(msg);
});

const { PORT } = process.env;

app.listen(PORT, async () => {
  await connect();
  initRedis();
  debugBase(`Email verifier server is running on port ${PORT}`);
});

const { PORT_CRONS = 4700 } = process.env;

app.listen(PORT_CRONS, () => {
  debugCrons(`Cron Server is now running on ${PORT_CRONS}`);
});
