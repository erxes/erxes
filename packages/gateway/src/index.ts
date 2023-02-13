import * as apm from 'elastic-apm-node';
import * as dotenv from 'dotenv';
// import * as ws from 'ws';
dotenv.config();

if (process.env.ELASTIC_APM_HOST_NAME) {
  apm.start({
    serviceName: `${process.env.ELASTIC_APM_HOST_NAME}-gateway`,
    serverUrl: 'http://172.104.115.19:8200'
  });
}

// import * as ws from 'ws';
import * as express from 'express';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';
// import { loadSubscriptions } from './subscription';
import userMiddleware from './middlewares/userMiddleware';
import pubsub from './subscription/pubsub';
import {
  clearCache,
  redis,
  setAfterMutations,
  setBeforeResolvers,
  setAfterQueries
} from './redis';
import { initBroker } from './messageBroker';
import * as cors from 'cors';
import { retryGetProxyTargets, ErxesProxyTarget } from './proxy/targets';
import createErxesProxyMiddleware from './proxy/create-middleware';
import apolloRouter from './apollo-router';
import { ChildProcess } from 'child_process';
import { startSubscriptionServer } from './subscription';
import { Disposable } from 'graphql-ws';

const {
  NODE_ENV,
  DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  ALLOWED_ORIGINS,
  // PLUGINS_INTERNAL_PORT,
  PORT,
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX
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

  app.use(cookieParser());

  app.use(userMiddleware);

  // TODO: Find some solution so that we can stop forwarding /read-file, /initialSetup etc.
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

  // app.use(
  //   /\/((?!graphql).)*/,
  //   createProxyMiddleware({
  //     target:
  //       NODE_ENV === 'production'
  //         ? `http://plugin_core_api${
  //             PLUGINS_INTERNAL_PORT ? `:${PLUGINS_INTERNAL_PORT}` : ''
  //           }`
  //         : 'http://localhost:3300',
  //     router: async req => {
  //       const services = await getServices();

  //       let host;

  //       for (const service of services) {
  //         if (
  //           req.path.includes(`/pl:${service}/`) ||
  //           req.path.includes(`/pl-${service}/`)
  //         ) {
  //           const foundService = await getService(service);
  //           host = foundService.address;
  //           break;
  //         }
  //       }

  //       if (host) {
  //         return host;
  //       }
  //     },
  //     onProxyReq: (proxyReq, req: any) => {
  //       proxyReq.setHeader('hostname', req.hostname);
  //       proxyReq.setHeader('userid', req.user ? req.user._id : '');
  //     },
  //     pathRewrite: async path => {
  //       let newPath = path;

  //       const services = await getServices();

  //       for (const service of services) {
  //         newPath = newPath
  //           .replace(`/pl:${service}/`, '/')
  //           .replace(`/pl-${service}/`, '/');
  //       }

  //       return newPath;
  //     }
  //   })
  // );

  const targets: ErxesProxyTarget[] = await retryGetProxyTargets();
  await apolloRouter(targets);

  app.use(createErxesProxyMiddleware(targets));

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

  subscriptionServer = await startSubscriptionServer(httpServer);

  // Why are we parsing the body twice? When we don't use the body
  app.use(
    express.json({
      limit: '15mb'
    })
  );

  app.use(express.urlencoded({ limit: '15mb', extended: true }));

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
