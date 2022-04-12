import * as dotenv from 'dotenv';
dotenv.config();

import { ApolloServer } from 'apollo-server-express';
import { ApolloGateway } from '@apollo/gateway';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as ws from 'ws';
import * as express from 'express';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';
import { loadSubscriptions } from './subscription';
import { createGateway, IGatewayContext } from './gateway';
import userMiddleware from './middlewares/userMiddleware';
import * as db from './db';
import pubsub from './subscription/pubsub';
import { clearCache, getService, getServices, redis, setAfterMutations } from './redis';
import { initBroker } from './messageBroker';

const {
  MAIN_APP_DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  DASHBOARD_DOMAIN,
  API_DOMAIN,
  PORT,
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX
} = process.env;

(async () => {
  await db.connect();

  await clearCache();

  const app = express();

  app.use(cookieParser());

  app.use(userMiddleware);

  // TODO: Find some solution so that we can stop forwarding /read-file, /initialSetup etc.
  app.use(
    /\/((?!graphql).)*/,
    createProxyMiddleware({
      target: API_DOMAIN,
      router: async req => {
        const services = await getServices();

        let host;

        for (const service of services) {
          if (req.path.includes(`/pl:${service}/`)) {
            const foundService = await getService(service);
            host = foundService.address;
            break;
          }
        }

        if (host) {
          return host;
        }
      },
      onProxyReq: (proxyReq, req: any) => {
        proxyReq.setHeader('userid', req.user ? req.user._id : '');
      },
      pathRewrite: async path => {
        let newPath = path;

        const services = await getServices();

        for (const service of services) {
          newPath = newPath.replace(`/pl:${service}`, '');
        }

        return newPath;
      }
    })
  );

  // for health check
  app.get('/health', async (_req, res) => {
    res.end('ok');
  });

  const httpServer = http.createServer(app);

  httpServer.on('close', () => {
    try {
      db.disconnect();
    } catch (e) {}

    try {
      pubsub.close();
    } catch (e) {
      console.log('PubSub client disconnected');
    }
  });

  const wsServer = new ws.Server({
    server: httpServer,
    path: '/graphql'
  });

  const gateway: ApolloGateway = await createGateway();

  const apolloServer = new ApolloServer({
    gateway,
    // for graceful shutdowns
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({
      res,
      req
    }: {
      res;
      req;
    }): IGatewayContext => {
      return { res, req };
    }
  });

  let subscriptionsLoaded = false;
  gateway.onSchemaLoadOrUpdate(async ({ apiSchema }) => {
    if (subscriptionsLoaded) {
      return;
    }

    try {
      await loadSubscriptions(apiSchema, wsServer);
      subscriptionsLoaded = true;
    } catch (e) {
      console.error(e);
    }
  });

  try {
    await apolloServer.start();
  } catch (e) {
    console.error(e);
    console.error(
      `Gateway might have started before enabled services are ready.`
    );
    process.exit(1);
  }

  apolloServer.applyMiddleware({
    app,
    path: '/graphql',
    cors: {
      credentials: true,
      origin: [
        MAIN_APP_DOMAIN || 'http://localhost:3000',
        WIDGETS_DOMAIN || '',
        ...(CLIENT_PORTAL_DOMAINS || '').split(','),
        DASHBOARD_DOMAIN || 'http://localhost:4200',
        'https://studio.apollographql.com',
      ]
    }
  });

  const port = PORT || 4000;

  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));

  await initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis });

  await setAfterMutations();

  console.log(
    `Erxes gateway ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
})();
