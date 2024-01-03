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
import { startRouter, stopRouter } from './apollo-router';
import {
  startSubscriptionServer,
  stopSubscriptionServer
} from './subscription';
import { applyInspectorEndpoints } from '@erxes/api-utils/src/inspect';

const {
  DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  ALLOWED_ORIGINS,
  PORT,
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX
} = process.env;

(async () => {
  const app = express();

  // for health check
  app.get('/health', async (_req, res) => {
    res.end('ok');
  });

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

  await startRouter(targets);

  await applyProxiesCoreless(app, targets);

  const httpServer = http.createServer(app);

  httpServer.on('close', () => {
    try {
      pubsub.close();
    } catch (e) {
      console.log('PubSub client disconnected');
    }
  });

  await startSubscriptionServer(httpServer);

  // Why are we parsing the body twice? When we don't use the body
  app.use(
    express.json({
      limit: '15mb'
    })
  );

  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  applyInspectorEndpoints(app, 'gateway');

  const port = PORT || 4000;

  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));

  await initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis, app });

  await setBeforeResolvers();
  await setAfterMutations();
  await setAfterQueries();

  // this has to be applied last, just like 404 route handlers are applied last
  applyProxyToCore(app, targets);

  console.log(`Erxes gateway ready at http://localhost:${port}/graphql`);
})();

(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, async () => {
    console.log(`Exiting on signal ${sig}`);
    await stopSubscriptionServer();
    await stopRouter(sig);
    process.exit(0);
  });
});
