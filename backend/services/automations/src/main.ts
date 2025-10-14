import cookieParser from 'cookie-parser';
import cors from 'cors';
import {
  closeMongooose,
  createHealthRoute,
  isDev,
  keyForConfig,
  redis,
} from 'erxes-api-shared/utils';
import express from 'express';
import * as http from 'http';
import { initMQWorkers } from './bullmq';
import { debugError, debugInfo } from '@/debuuger';

const {
  DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  ALLOWED_DOMAINS,
  PORT,
  LOAD_BALANCER_ADDRESS,
  MONGO_URL,
} = process.env;

const port = PORT ? Number(PORT) : 3302;
const serviceName = 'automations-service';

const app = express();

// don't move it above telnyx controllers
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.use(
  express.json({
    limit: '15mb',
  }),
);

app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin: [
    ...(DOMAIN ? [DOMAIN] : []),
    ...(isDev ? ['http://localhost:3001'] : []),
    ALLOWED_DOMAINS || 'http://localhost:3200',
    ...(CLIENT_PORTAL_DOMAINS || '').split(','),
    ...(process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((c) => c && RegExp(c)),
  ],
};

app.use(cors(corsOptions));

app.get('/health', createHealthRoute(serviceName));

const httpServer = http.createServer(app);

httpServer.listen(port, async () => {
  await redis.set(
    keyForConfig(serviceName),

    JSON.stringify({
      dbConnectionString: MONGO_URL,
    }),
  );

  const address =
    LOAD_BALANCER_ADDRESS ||
    `http://${isDev ? 'localhost' : serviceName}:${port}`;

  await redis.set(`service-v3-logs`, address);

  console.log(`service-v3-logs joined with ${address}`);
  await initMQWorkers(redis);
});

process.stdin.resume();

async function leaveServiceDiscovery() {
  try {
    console.log(`service-v3automations left ${port}`);
    debugInfo('Left from service discovery');
  } catch (e) {
    debugError(e);
  }
}

async function closeHttpServer() {
  try {
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error: Error | undefined) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  } catch (e) {
    debugError(e);
  }
}

(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => {
  process.on(sig, async () => {
    await closeHttpServer();
    await closeMongooose();
    await leaveServiceDiscovery();
    process.exit(0);
  });
});
