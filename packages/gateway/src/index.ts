import * as dotenv from 'dotenv';
dotenv.config();

import { ApolloServer } from 'apollo-server-express';
import { ApolloGateway } from '@apollo/gateway';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import ws from 'ws';
import express, { Request, Response } from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import { loadSubscriptions } from './subscription';
import { createGateway, IGatewayContext } from './gateway';
import userMiddleware from './middlewares/userMiddleware';
import * as db from './db';
import pubsub from './subscription/pubsub';
import { getService, getServices } from './redis';
import { initBroker } from './messageBroker';

const { MAIN_APP_DOMAIN, API_DOMAIN, PORT } = process.env;

(async () => {
  await db.connect();

  const app = express();

  app.use(cookieParser());

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

  app.use(userMiddleware);

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
      res: Response;
      req: Request & { user?: any };
    }): IGatewayContext => {
      return { res, req };
    }
  });

  let subscriptionsLoaded = false;
  gateway.onSchemaLoadOrUpdate(async ({ apiSchema }) => {
    if (subscriptionsLoaded) { return; }

    try {
      // await loadSubscriptions(apiSchema, wsServer);
      subscriptionsLoaded = true;
    } catch (e) {
      console.error(e);
    }
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    path: '/graphql',
    cors: {
      credentials: true,
      origin: [
        MAIN_APP_DOMAIN || 'http://localhost:3000',
        'http://localhost:3001',
        'https://studio.apollographql.com',
        'http://localhost:3200'
      ]
    }
  });

  const port = PORT || 4000;

  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));

  await initBroker();

  console.log(
    `Erxes gateway ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
})();
