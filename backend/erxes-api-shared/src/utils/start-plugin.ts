import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import * as trpcExpress from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express, {
  Request as ApiRequest,
  Response as ApiResponse,
  Application,
  Router,
} from 'express';
import { DocumentNode, GraphQLScalarType } from 'graphql';
import * as http from 'http';
import * as path from 'path';
import { startPayments } from '../common-modules/payment/worker';
import type { IPropertyMeta, SegmentConfigs } from '../core-modules';
import { initSegmentProducers, startAutomations } from '../core-modules';
import { AutomationConfigs } from '../core-modules/automations/types';
import type { ImportExportConfigs } from '../core-modules/import-export/types';
import { startImportExportWorker } from '../core-modules/import-export/worker';
import { IMainContext, IPermissionConfig } from '../core-types';
import { generateApolloContext, wrapApolloResolvers } from './apollo';
import { extractUserFromHeader } from './headers';
import { AfterProcessConfigs, logHandler, startAfterProcess } from './logs';
import { closeMongooose } from './mongo';
import {
  initializePluginConfig,
  joinErxesGateway,
  leaveErxesGateway,
} from './service-discovery';
import { createTRPCContext } from './trpc';
import { getSubdomain } from './utils';

dotenv.config();

type IMeta = {
  automations?: AutomationConfigs;
  segments?: SegmentConfigs;
  afterProcess?: AfterProcessConfigs;
  payments?: any;
  notifications?: any;
  tags?: any;
  properties?: IPropertyMeta;
  permissions?: IPermissionConfig;
};

type ApiHandler = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  resolver: (req: ApiRequest, res: ApiResponse) => Promise<void> | void;
};
type ResolverObject = {
  [key: string]: (...args: any[]) => any;
};

type GraphqlResolver = {
  [key: string]: ResolverObject | GraphQLScalarType;
};

type ConfigTypes = {
  name: string;
  port: number;
  graphql: () => Promise<{
    resolvers: GraphqlResolver;
    typeDefs: DocumentNode;
  }>;
  expressRouter?: Router;
  apolloServerContext: (
    subdomain: string,
    context: any,
    req: ApiRequest,
    res: ApiResponse,
  ) => Promise<IMainContext>;
  onServerInit?: (app: express.Express) => Promise<void>;
  middlewares?: any;
  apiHandlers?: ApiHandler[];
  hasSubscriptions?: boolean;
  corsOptions?: any;
  subscriptionPluginPath?: any;
  importExport?: ImportExportConfigs;
  trpcAppRouter?: {
    router: any;
    createContext: <TContext>(
      subdomain: string,
      context: any,
    ) => Promise<TContext>;
  };
  meta?: IMeta;
};

export async function startPlugin(
  configs: ConfigTypes,
): Promise<express.Express> {
  const PORT = process.env.PORT ? Number(process.env.PORT) : configs.port;

  const app = express();
  app.disable('x-powered-by');
  app.use(cors(configs.corsOptions || {}));
  app.use(
    express.json({
      limit: '15mb',
    }),
  );
  app.use(cookieParser());

  // for health check
  app.get('/health', async (_req, res) => {
    res.end('ok');
  });

  if (configs.expressRouter) {
    app.use(configs.expressRouter);
  }

  if (configs.middlewares) {
    for (const middleware of configs.middlewares) {
      app.use(middleware);
    }
  }

  if (configs.apiHandlers) {
    const apiHandlers = configs.apiHandlers || [];
    for (const handler of apiHandlers) {
      const { method, path, resolver } = handler;

      const METHODS = {
        GET: 'get',
        POST: 'post',
        PUT: 'put',
        PATCH: 'patch',
        DELETE: 'delete',
      } as const;

      type Method = keyof typeof METHODS;
      type LowercaseMethod = (typeof METHODS)[Method];

      // Ensure `method` is one of the keys
      const METHOD = METHODS[method as Method] as LowercaseMethod;

      (app as Record<LowercaseMethod, Application[LowercaseMethod]>)[METHOD](
        path,
        async (req: ApiRequest, res: ApiResponse) => {
          return await logHandler(async () => await resolver(req, res), {
            subdomain: getSubdomain(req),
            source: 'webhook',
            action: method,
            payload: {
              path,
              headers: req.headers,
              body: req.body,
              query: req?.query,
            },
            userId: extractUserFromHeader(req.headers)?._id,
          });
        },
      );
    }
  }

  if (configs.hasSubscriptions) {
    app.get('/subscriptionPlugin.js', async (_req, res) => {
      res.sendFile(path.join(configs.subscriptionPluginPath));
    });
  }

  if (configs.trpcAppRouter) {
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: configs.trpcAppRouter.router,
        createContext: createTRPCContext(configs.trpcAppRouter.createContext),
      }),
    );
  }

  app.use((req: any, _res, next) => {
    req.rawBody = '';

    req.on('data', (chunk: any) => {
      req.rawBody += chunk.toString();
    });

    next();
  });

  // Error handling middleware
  // app.use((error: any, _req: any, res: any) => {
  //   const msg = filterXSS(error.message);

  //   // debugError(`Error: ${msg}`);

  //   res.status(500).send(msg);
  // });

  const httpServer = http.createServer(app);
  httpServer.keepAliveTimeout = 120000;
  httpServer.headersTimeout = 121000;

  // GRACEFULL SHUTDOWN
  process.stdin.resume(); // so the program will not close instantly

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

  async function leaveServiceDiscovery() {
    try {
      await leaveErxesGateway(configs.name, PORT);
      console.log(`Left service discovery. name=${configs.name} port=${PORT}`);
    } catch (e) {
      console.error(e);
    }
  }

  // If the Node process ends, close the Mongoose connection
  (['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => {
    process.on(sig, async () => {
      await closeHttpServer();
      await closeMongooose();
      await leaveServiceDiscovery();
      process.exit(0);
    });
  });

  const generateApolloServer = async () => {
    // const services = await getServices();
    // debugInfo(`Enabled services .... ${JSON.stringify(services)}`);

    const { typeDefs, resolvers } = await configs.graphql();

    return new ApolloServer({
      schema: buildSubgraphSchema([
        {
          typeDefs,
          resolvers: wrapApolloResolvers(resolvers as any),
        },
      ]),

      // for graceful shutdown
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
  };

  const apolloServer = await generateApolloServer();
  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: generateApolloContext<IMainContext>(configs.apolloServerContext),
    }),
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve),
  );

  console.log(
    `🚀 ${configs.name} graphql api ready at http://localhost:${PORT}/graphql`,
  );

  if (configs.meta) {
    const {
      automations,
      segments,
      afterProcess,
      notifications,
      payments,
    } = configs.meta || {};

    if (automations) {
      await startAutomations(app, configs.name, automations);
    }

    if (segments) {
      await initSegmentProducers(app, configs.name, segments);
    }

    if (afterProcess) {
      await startAfterProcess(app, configs.name, afterProcess);
    }

    if (notifications) {
      await initializePluginConfig(
        configs.name,
        'notifications',
        notifications,
      );
    }

    if (payments) {
      await startPayments(configs.name, payments);
    }
  } // end configs.meta if

  await joinErxesGateway({
    name: configs.name,
    port: PORT,
    hasSubscriptions: configs.hasSubscriptions,
    meta: configs.meta,
  });

  if (configs.onServerInit) {
    configs.onServerInit(app);
  }

  if (configs.importExport) {
    startImportExportWorker({
      pluginName: configs.name,
      config: {
        ...configs.importExport,
      },
      app,
    });
  }

  //   applyInspectorEndpoints(configs.name);

  //   debugInfo(`${configs.name} server is running on port: ${PORT}`);

  return app;
}

export default startPlugin;
