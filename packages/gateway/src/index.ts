import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
dotenv.config();

import * as express from 'express';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';
import userMiddleware from './middlewares/userMiddleware';
import pubsub from './subscription/pubsub';
import {
  redis,
  setAfterMutations,
  setBeforeResolvers,
  setAfterQueries
} from './redis';
import { initBroker } from './messageBroker';
import * as cors from 'cors';
import { retryGetProxyTargets, ErxesProxyTarget } from './proxy/targets';
import {
  applyProxiesCoreless,
  applyProxyToCore
} from './proxy/create-middleware';
import apolloRouter from './apollo-router';
import { ChildProcess } from 'child_process';
import { startSubscriptionServer } from './subscription';
import { Disposable } from 'graphql-ws';
import { clearCache } from '@erxes/api-utils/src/serviceDiscovery';

const {
  NODE_ENV,
  DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  ALLOWED_ORIGINS,
  PORT,
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX,
  SENTRY_DSN
} = process.env;

let apolloRouterProcess: ChildProcess | undefined = undefined;
let subscriptionServer: Disposable | undefined = undefined;

const stopRouter = () => {
  if (!apolloRouterProcess) {
    return;
  }
  apolloRouterProcess.kill('SIGTERM');
};

(async () => {
  await clearCache();

  const app = express();

  // for health check
  app.get('/health', async (_req, res) => {
    res.end('ok');
  });

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // Automatically instrument Node.js libraries and frameworks
        ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0 // Profiling sample rate is relative to tracesSampleRate
    });
  }

  // RequestHandler creates a separate execution context, so that all
  // transactions/spans/breadcrumbs are isolated across requests
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  app.use(cookieParser());

  app.use(userMiddleware);

  const corsOptions = {
    credentials: true,
    origin: [
      DOMAIN ? DOMAIN : 'http://localhost:3000',
      WIDGETS_DOMAIN ? WIDGETS_DOMAIN : 'http://localhost:3200',
      ...(CLIENT_PORTAL_DOMAINS || '').split(','),
      'https://studio.apollographql.com',
      ...(ALLOWED_ORIGINS || '').split(',').map(c => c && RegExp(c))
    ]
  };

  app.use(cors(corsOptions));

  const targets: ErxesProxyTarget[] = await retryGetProxyTargets();
  await apolloRouter(targets);

  applyProxiesCoreless(app, targets);

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  const httpServer = http.createServer(app);

  httpServer.on('close', () => {
    try {
      pubsub.close();
    } catch (e) {
      console.log('PubSub client disconnected');
    }
  });

  subscriptionServer = await startSubscriptionServer(httpServer);

  // Why are we parsing the body twice? When we don't use the body
  app.use(
    express.json({
      limit: '15mb'
    })
  );

  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // this has to be applied last, just like 404 route handlers are applied last
  applyProxyToCore(app, targets);

  const port = PORT || 4000;

  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));

  await initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis });

  await setBeforeResolvers();
  await setAfterMutations();
  await setAfterQueries();

  console.log(`Erxes gateway ready at http://localhost:${port}/graphql`);
})();

(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, async () => {
    if (NODE_ENV === 'development') {
      clearCache();
    }
    if (subscriptionServer) {
      try {
        subscriptionServer.dispose();
      } catch (e) {}
    }
    stopRouter();
    process.exit(0);
  });
});
