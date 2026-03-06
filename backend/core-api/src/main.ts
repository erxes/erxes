import * as trpcExpress from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import {
  closeMongooose,
  createTRPCContext,
  isDev,
  joinErxesGateway,
  leaveErxesGateway,
} from 'erxes-api-shared/utils';
import express from 'express';
import rateLimit from 'express-rate-limit';
import * as http from 'http';
import * as path from 'path';
import { appRouter } from '~/init-trpc';
import { initApolloServer } from './apollo/apolloServer';
import { generateModels } from './connectionResolvers';
import meta from './meta';
import { initAutomation } from './meta/automations/automations';
import { initBroadcast } from './meta/broadcast';
import initImportExport from './meta/import-export/import';
import { initSegmentCoreProducers } from './meta/segments';
import { router } from './routes';

dotenv.config();

const { DOMAIN, ALLOWED_ORIGINS, WIDGETS_DOMAIN, ALLOWED_DOMAINS } =
  process.env;

const port = process.env.PORT ? Number(process.env.PORT) : 3300;

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
    DOMAIN || 'http://localhost:3000',
    WIDGETS_DOMAIN || 'http://localhost:3200',
    ...(isDev ? ['http://localhost:3001', 'http://localhost:4200'] : []),
    ...(ALLOWED_DOMAINS || '').split(','),
    ...(ALLOWED_ORIGINS || '').split(',').map((c) => c && RegExp(c)),
  ],
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));
app.use(router);

const fileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.get('/subscriptionPlugin.js', fileLimiter, async (_req, res) => {
  const apolloSubscriptionPath = path.join(
    require('path').resolve(
      __dirname,
      'apollo',
      process.env.NODE_ENV === 'production'
        ? 'subscription.js'
        : 'subscription.ts',
    ),
  );

  res.sendFile(apolloSubscriptionPath);
});

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext(async (subdomain, context) => {
      const models = await generateModels(subdomain, context);

      context.models = models;

      return context;
    }),
  }),
);

app.get('/health', async (_req, res) => {
  res.end('ok');
});

// Wrap the Express server
const httpServer = http.createServer(app);

httpServer.listen(port, async () => {
  await initApolloServer(app, httpServer);

  await joinErxesGateway({
    name: 'core',
    port,
    hasSubscriptions: true,
    meta,
  });
  await initAutomation(app);
  await initSegmentCoreProducers(app);
  await initImportExport(app);
  await initBroadcast(app);
});

// GRACEFULL SHUTDOWN
process.stdin.resume(); // so the program will not close instantly

async function leaveServiceDiscovery() {
  try {
    await leaveErxesGateway('core', port);
    console.log('Left from service discovery');
  } catch (e) {
    console.error(e);
  }
}

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

// If the Node process ends, close the http-server and mongoose.connection and leaveErxesGateway service discovery.
(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => {
  process.on(sig, async () => {
    await closeHttpServer();
    await closeMongooose();
    await leaveServiceDiscovery();
    process.exit(0);
  });
});
