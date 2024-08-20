import * as dotenv from 'dotenv';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import { filterXSS } from 'xss';
import { bulk, single } from './api';
import { validateBulkPhones, validateSinglePhone } from './apiPhoneVerifier';
import { connect } from './connection';
import './cronJobs/verifier';

import { debugBase, debugCrons, debugRequest, sendRequest } from './utils';
import fetch = require('node-fetch');
import { Emails } from './models';

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

app.get('/cook', async (req, res) => {
  const KEY = '';
  const url =
    `https://api.kickbox.com/v2/verify-batch/1493727?apikey=${KEY}`;
  const csvFilePath = path.join(__dirname, 'kickbox.csv');
  const data: any[] = [];

  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on('data', async (row) => {
      console.log('RWO = ', row);
      let status = 'unknown';
      if (row.result === 'deliverable') status = 'valid';
      if (row.result === 'undeliverable') status = 'invalid';
      data.push({
        email: row.email,
        status,
      });

      const found = await Emails.findOne({ email: row.email });

      if (!found) {
        Emails.createEmail({ email: row.email, status });
      }
    })
    .on('end', async () => {
      await sendRequest({
        url: `http://localhost:4000/pl:contacts/verifier/webhook`,
        method: 'POST',
        body: {
          emails: data,
        },
      });
    });

  // const resp = await fetch(response.download_url, {
  //   method: 'GET',
  // }).then((r) => r.text());

  // console.log(resp);

  // return

  // const rows = resp.split('\n');
  // const emails: Array<{ email: string; status: string }> = [];

  // for (const [index, row] of rows.entries()) {
  //   if (index !== 0) {
  //     const rowArray = row.split(',');

  //     if (rowArray.length > 12) {
  //       const email = rowArray[0];
  //       let status = rowArray[2].toLowerCase();

  //       emails.push({
  //         email,
  //         status,
  //       });

  //       const found = await Emails.findOne({ email });

  //       if (!found) {
  //         Emails.createEmail({ email, status });
  //       }
  //     }
  //   }
  // }

  // debugBase(`Sending bulk email validation result to erxes-api`);

  // await sendRequest({
  //   url: `http://localhost:4000/verifier/webhook`,
  //   method: 'POST',
  //   body: {
  //     emails,
  //   },
  // });
});

app.post('/verify-single', async (req, res, next) => {
  debugRequest(debugBase, req);

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
    return next(e);
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
  debugBase(`Email verifier server is running on port ${PORT}`);
});

const { PORT_CRONS = 4700 } = process.env;

app.listen(PORT_CRONS, () => {
  debugCrons(`Cron Server is now running on ${PORT_CRONS}`);
});
