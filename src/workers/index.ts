import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as formidable from 'formidable';
import * as path from 'path';
import { filterXSS } from 'xss';
import { checkFile } from '../data/utils';
import { connect } from '../db/connection';
import { debugRequest, debugResponse, debugWorkers } from '../debuggers';
import userMiddleware from '../middlewares/userMiddleware';
import { initRedis } from '../redisClient';
import { importXlsFile } from './bulkInsert';
import { init } from './startup';
import { clearIntervals, createWorkers, removeWorkers, splitToCore } from './utils';

// load environment variables
dotenv.config();

initRedis();

// connect to mongo database
connect();

const app = express();
app.disable('x-powered-by');

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(userMiddleware);

app.post('/import-remove', async (req: any, res) => {
  debugRequest(debugWorkers, req);

  const { targetIds, contentType, importHistoryId } = req.body;

  const results = splitToCore(JSON.parse(targetIds));

  const workerFile =
    process.env.NODE_ENV === 'production'
      ? `./dist/workers/importHistoryRemove.worker.js`
      : './src/workers/importHistoryRemove.worker.import.js';

  const workerPath = path.resolve(workerFile);

  const workerData = {
    contentType,
    importHistoryId,
  };

  await createWorkers(workerPath, workerData, results);

  debugResponse(debugWorkers, req);

  return res.json({ status: 'started removing' });
});

app.post('/import-cancel', async (req: any, res) => {
  debugRequest(debugWorkers, req);

  clearIntervals();

  removeWorkers();

  return res.json({ status: 'ok' });
});

app.post('/import-file', async (req: any, res) => {
  const form = new formidable.IncomingForm();

  debugRequest(debugWorkers, req);

  const scopeBrandIds = JSON.parse(req.cookies.scopeBrandIds || '[]');

  form.parse(req, async (_err, fields: any, response) => {
    let status = '';

    try {
      status = await checkFile(response.file);
    } catch (e) {
      return res.json({ status: e.message });
    }

    // if file is not ok then send error
    if (status !== 'ok') {
      return res.json(status);
    }

    importXlsFile(response.file, fields.type, { scopeBrandIds, user: req.user })
      .then(result => {
        debugResponse(debugWorkers, req);
        return res.json(result);
      })
      .catch(e => {
        debugWorkers(`Error occured while importing ${e.message}`);
        return res.json({ status: 'error', message: e.message });
      });
  });
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(filterXSS(error.message));
});

const { PORT_WORKERS } = process.env;

app.listen(PORT_WORKERS, () => {
  init();

  debugWorkers(`Workers server is now running on ${PORT_WORKERS}`);
});
