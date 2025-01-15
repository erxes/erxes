import * as dotenv from 'dotenv';
import * as express from 'express';
import { filterXSS } from 'xss';
import { bulk, single } from './api';
import { validateBulkPhones, validateSinglePhone } from './apiPhoneVerifier';
import { connect } from './connection';
import './cronJobs/verifier';

import { debugCrons } from './utils';

// load environment variables
dotenv.config();

const app = express();

const urlencodedMiddleware = express.urlencoded({
  extended: true,
}) as express.RequestHandler;
const jsonMiddleware = express.json() as express.RequestHandler;

// Use the explicitly typed middleware function
app.use(urlencodedMiddleware);
app.use(jsonMiddleware);

app.get('/', (req, res) => {
  // return do not panic, it's healthy
  console.debug('health check request from', req.headers.origin);
  const html = `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Health Check</title>
                  </head>
                  <body>
                    <h1>Health status</h1>
                    <p>It's healthy</p>
                  </body>
                  </html>`;
  res.send(html);
});

app.post('/verify-single', async (req, res, next) => {

  const { email, phone, hostname } = req.body;
  console.debug('single verification request from', hostname);

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
    return next(e);
  }
});

app.post('/verify-bulk', async (req, res, next) => {
  const { phones, emails, hostname } = req.body;
  console.debug('bulk verification request from', hostname);
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

  res.status(500).send(msg);
});

const { PORT } = process.env;

app.listen(PORT, async () => {
  await connect();
});

const { PORT_CRONS = 4700 } = process.env;

app.listen(PORT_CRONS, () => {
  debugCrons(`Cron Server is now running on ${PORT_CRONS}`);
});
