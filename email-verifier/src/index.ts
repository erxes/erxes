import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from './connection';
import { initConsumer } from './messageBroker';
import { debugBase } from './utils';

// load environment variables
dotenv.config();

const app = express();

const { PORT } = process.env;

app.listen(PORT, async () => {
  await initConsumer();
  await connect();

  debugBase(`Email verifier server is running on port ${PORT}`);
});
