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
import type { IPropertyMeta, LogsConfigs, SegmentConfigs } from '../core-modules';
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

enum API_METHODS {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

type TAPIMethod = keyof typeof API_METHODS;

type IMeta = {
  automations?: AutomationConfigs;
  segments?: SegmentConfigs;
  logs?: LogsConfigs;
  afterProcess?: AfterProcessConfigs;
  payments?: any;
  notifications?: any;
  tags?: any;
  properties?: IPropertyMeta;
  permissions?: IPermissionConfig;
};

type ApiHandler = {
  method: TAPIMethod;
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
  const {
    //common
    name,
    port,
    // api configs
    corsOptions = {},
    expressRouter,
    middlewares,
    apiHandlers,
    // graphql
    hasSubscriptions,
    subscriptionPluginPath,
    graphql,
    apolloServerContext,
    trpcAppRouter,
    onServerInit,
    // meta
    meta,
    importExport,
  } = configs || {};
  const PORT = process.env.PORT ? Number(process.env.PORT) : port;

  const app = express();
  app.disable('x-powered-by');
  app.use(cors(corsOptions));
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

  if (expressRouter) {
    app.use(expressRouter);
  }

  if (middlewares) {
    for (const middleware of middlewares) {
      app.use(middleware);
    }
  }

  if (apiHandlers) {
    for (const handler of apiHandlers) {
      const { method, path, resolver } = handler;

      type LowercaseMethod = (typeof API_METHODS)[TAPIMethod];

      // Ensure `method` is one of the keys
      const METHOD = API_METHODS[method] as LowercaseMethod;
      type TApiMethodApp = Record<
        LowercaseMethod,
        Application[LowercaseMethod]
      >;

      (app as TApiMethodApp)[METHOD](
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

  if (hasSubscriptions) {
    app.get('/subscriptionPlugin.js', async (_req, res) => {
      res.sendFile(path.join(subscriptionPluginPath));
    });
  }

  if (trpcAppRouter) {
    const { router, createContext } = trpcAppRouter;
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router,
        createContext: createTRPCContext(createContext),
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
      await leaveErxesGateway(name, PORT);
      console.log(`Left service discovery. name=${name} port=${PORT}`);
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

    const { typeDefs, resolvers } = await graphql();

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
      context: generateApolloContext<IMainContext>(apolloServerContext),
    }),
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve),
  );

  console.log(
    `🚀 ${name} graphql api ready at http://localhost:${PORT}/graphql`,
  );

  if (meta) {
    const { automations, segments, afterProcess, notifications, payments } =
      meta || {};

    if (automations) {
      await startAutomations(app, name, automations);
    }

    if (segments) {
      await initSegmentProducers(app, name, segments);
    }

    if (afterProcess) {
      await startAfterProcess(app, name, afterProcess);
    }

    if (notifications) {
      await initializePluginConfig(name, 'notifications', notifications);
    }

    if (payments) {
      await startPayments(name, payments);
    }
  } // end meta if

  await joinErxesGateway({
    name: name,
    port: PORT,
    hasSubscriptions: hasSubscriptions,
    meta: meta,
  });

  if (importExport) {
    startImportExportWorker({
      pluginName: name,
      config: {
        ...importExport,
      },
      app,
    });
  }

  if (onServerInit) {
    onServerInit(app);
  }

  //   applyInspectorEndpoints(name);

  //   debugInfo(`${name} server is running on port: ${PORT}`);

  return app;
}

export default startPlugin;
