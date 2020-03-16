import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { filterXSS } from 'xss';
import { single } from './api';
import { connect } from './connection';
import { initConsumer } from './messageBroker';
import { debugBase, debugRequest } from './utils';

// load environment variables
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/verify-single', async (req, res, next) => {
  debugRequest(debugBase, req);

  const { email } = req.body;

  try {
    const status = await single(email, true);

    return res.json({ status });
  } catch (e) {
    return next(new Error(e));
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
  await initConsumer();
  await connect();

  debugBase(`Email verifier server is running on port ${PORT}`);
});
