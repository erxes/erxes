import app from '@erxes/api-utils/src/app';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { disconnect } from '@erxes/api-utils/src/mongo-connection';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { createServer } from 'http';
import { filterXSS } from 'xss';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import sanitizeFilename from '@erxes/api-utils/src/sanitize-filename';
import { initApolloServer } from './apolloClient';
import { generateErrors } from './data/modules/import/generateErrors';
import { uploadsFolderPath } from './data/utils';
import { initBroker } from './messageBroker';
import { pdfUploader, taskChecker, taskRemover } from './worker/pdf/utils';
import { join, leave } from './serviceDiscovery';
import { readFileRequest } from './worker/export/utils';
import userMiddleware from '@erxes/api-utils/src/middlewares/user';

async function closeHttpServer() {
  try {
    await new Promise<void>((resolve, reject) => {
      // Stops the server from accepting new connections and finishes existing connections.
      httpServer.close((error: Error | undefined) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  } catch (e) {
    console.error(e);
  }
}

// load environment variables
dotenv.config();

app.get(
  '/download-import-error',
  routeErrorHandling(async (req: any, res) => {
    const { query } = req;

    const subdomain = getSubdomain(req);

    const { name, response } = await generateErrors(query, subdomain);

    res.attachment(`${name}.csv`);
    return res.send(response);
  })
);

app.get('/read-file', async (req: any, res: any) => {
  try {
    const key = req.query.key;

    const response = await readFileRequest({
      key,
    });

    res.attachment(key);

    return res.send(response);
  } catch (e) {
    return console.error(e);
  }
});

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

app.use(userMiddleware);

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);

  res.status(500).send(filterXSS(error.message));
});

const importUploadTmpDir = path.join(uploadsFolderPath, 'tmp');
const importUpload = multer({ dest: importUploadTmpDir });

app.post(
  '/import-upload-file',
  importUpload.single('file'),
  routeErrorHandling(async (req: any, res: any) => {
    await fs.promises.mkdir(uploadsFolderPath, { recursive: true });
    await fs.promises.mkdir(importUploadTmpDir, { recursive: true });

    const safeName = sanitizeFilename(req.file.originalname);
    const finalPath = path.join(uploadsFolderPath, safeName);

    await fs.promises.rename(req.file.path, finalPath);

    return res.send(safeName);
  })
);

// upload only pdf
app.post('/upload-pdf', pdfUploader);

app.get('/upload-status/:taskId', taskChecker);

app.delete('/delete-task/:taskId', taskRemover);

const httpServer = createServer(app);

const { PORT = '3700' } = process.env;

httpServer.listen(PORT, async () => {
  await initApolloServer(app, httpServer);

  await join({
    name: 'workers',
    port: PORT,
    hasSubscriptions: false,
    meta: {},
  });

  await initBroker();

  console.log(`GraphQL Server is now running on ${PORT}`);
});

// If the Node process ends, close the http-server and mongoose.connection and leave service discovery.
(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => {
  process.on(sig, async () => {
    await closeHttpServer();
    await leave('worker', PORT);
    await disconnect();
    process.exit(0);
  });
});
