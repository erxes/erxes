import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as http from 'http';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { retryGetProxyTargets } from '~/proxy/targets';
import { startRouter, stopRouter } from '~/apollo-router';
import userMiddleware from '~/middlewares/userMiddleware';
import { initMQWorkers } from '~/mq/workers/workers';
import {
  applyProxiesCoreless,
  applyProxyToCore,
  proxyReq,
} from '~/proxy/middleware';

import { getPlugin, isDev, redis } from 'erxes-api-shared/utils';
import { applyGraphqlLimiters } from '~/middlewares/graphql-limiter';
import {
  startSubscriptionServer,
  stopSubscriptionServer,
} from './subscription';
import * as fs from 'fs';
import * as path from 'path';

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const { DOMAIN } = process.env;

const corsOptions = {
  credentials: true,
  origin: [
    ...(DOMAIN ? [DOMAIN] : []),
    ...(isDev ? ['http://localhost:3001','http://localhost:5173'] : []),
  ],
};

const myQueue = new Queue('gateway-service-discovery', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: false,
  },
});

const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [new BullMQAdapter(myQueue)],
  serverAdapter: serverAdapter,
});

serverAdapter.setBasePath('/bullmq-board');

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(userMiddleware);

app.use('/bullmq-board', serverAdapter.getRouter());

app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.get('/locales/:lng', async (req, res) => {
  try {
    const lngJson = fs.readFileSync(
      path.join(__dirname, `./locales/${req.params.lng}`),
    );
    res.json(JSON.parse(lngJson.toString()));
  } catch {
    res.status(500).send('Error fetching services');
  }
});
app.use('/pl:serviceName', async (req, res) => {
  try {
    const serviceName: string = req.params.serviceName.replace(':', '');
    const path = req.path;

    // Forbid access to trpc endpoints
    if (path.startsWith('/trpc')) {
      return res.status(403).json({
        error: 'Access to trpc endpoints through plugin proxy is forbidden',
      });
    }

    const service = await getPlugin(serviceName);

    const targetUrl = service.address;

    if (targetUrl) {
      // Proxy the request to the target service using the custom headers
      return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true, // Change the origin header to the target URL's origin
        on: {
          proxyReq,
        },
        pathRewrite: {
          [`^/pl:${serviceName}`]: '/', // Rewriting the path if needed
        },
      })(req, res); // Forward the request to the target service
    } else {
      // Service not found, return 404
      res.status(404).send('Service not found');
    }
  } catch {
    res.status(500).send('Error fetching services');
  }
});

let httpServer: http.Server;

async function start() {
  try {
    // Initial fetch of the proxy targets
    global.currentTargets = await retryGetProxyTargets();

    // Initialize MQ workers
    console.log('Initializing MQ workers...');
    await initMQWorkers(redis);
    console.log('MQ workers initialized');

    // Start the router with the initial targets
    console.log('Starting the router...');
    await startRouter(global.currentTargets);
    console.log('Router started successfully');

    // Apply the initial proxy middleware
    applyGraphqlLimiters(app);
    applyProxiesCoreless(app);
    applyProxyToCore(app, global.currentTargets);

    // Start the HTTP server
    httpServer = http.createServer(app);
    await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));

    await startSubscriptionServer(httpServer);
    console.log(`Server is running at http://localhost:${port}/`);
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

// Graceful shutdown for SIGINT and SIGTERM
(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Exiting on signal ${signal}`);

    try {
      stopRouter(signal);
      await stopSubscriptionServer();
      if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve));
      }
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

start();
