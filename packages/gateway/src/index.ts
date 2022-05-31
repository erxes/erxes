import * as dotenv from 'dotenv';
dotenv.config();

import { ApolloServer } from 'apollo-server-express';
import { ApolloGateway } from '@apollo/gateway';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as ws from 'ws';
import * as express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';
import { loadSubscriptions } from './subscription';
import { createGateway, IGatewayContext } from './gateway';
import userMiddleware from './middlewares/userMiddleware';
import pubsub from './subscription/pubsub';
import {
  clearCache,
  getService,
  getServices,
  redis,
  setAfterMutations
} from './redis';
import { initBroker } from './messageBroker';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { handleUnsubscription } from './util/handleUnsubscription';

const {
  DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  PORT,
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX
} = process.env;

(async () => {
  await clearCache();

  const app = express();

  app.use(
    express.json({
      limit: '15mb'
    })
  );

  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  app.use(cookieParser());

  app.use(userMiddleware);

  // unsubscribe
  app.get(
    '/unsubscribe',
    routeErrorHandling(async (req: any, res) => {
      const subdomain = 'os';

      await handleUnsubscription(subdomain, req.query);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      const template = fs.readFileSync(
        __dirname + '/private/emailTemplates/unsubscribe.html'
      );

      return res.send(template);
    })
  );

  // TODO: Find some solution so that we can stop forwarding /read-file, /initialSetup etc.
  app.use(
    /\/((?!graphql).)*/,
    createProxyMiddleware({
      target:
        process.env.NODE_ENV === 'production'
          ? 'http://plugin_core_api'
          : 'http://localhost:3300',
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
        proxyReq.setHeader('hostname', req.hostname);
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
    introspection: true,
    // for graceful shutdowns
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ res, req }: { res; req }): IGatewayContext => {
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
        DOMAIN ? DOMAIN : 'http://localhost:3000',
        WIDGETS_DOMAIN ? WIDGETS_DOMAIN : 'http://localhost:3200',
        ...(CLIENT_PORTAL_DOMAINS || '').split(','),
        'https://studio.apollographql.com',
        ...(process.env.ALLOWED_ORIGINS || '')
          .split(',')
          .map(c => c && RegExp(c))
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
