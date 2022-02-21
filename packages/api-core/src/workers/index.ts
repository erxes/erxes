import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { filterXSS } from 'xss';
import { connect } from '../db/connection';
import { debugError, debugWorkers } from '../debuggers';
import { initMemoryStorage } from '../inmemoryStorage';
import { initBroker } from './messageBroker';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.disable('x-powered-by');

// for health check
app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);

  res.status(500).send(filterXSS(error.message));
});

const { PORT_WORKERS = 3700 } = process.env;

app.listen(PORT_WORKERS, () => {
  initMemoryStorage();

  initBroker(app)
    .catch(e => {
      debugError(`Error ocurred during message broker init ${e.message}`);
    })

  debugWorkers(`Workers server is now running on ${PORT_WORKERS}`);
});
