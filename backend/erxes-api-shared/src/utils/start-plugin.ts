import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import * as Sentry from '@sentry/node';
import * as trpcExpress from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express, {
  Request as ApiRequest,
  Response as ApiResponse,
  Router,
} from 'express';
import rateLimit from 'express-rate-limit';
import { DocumentNode, GraphQLScalarType } from 'graphql';
import * as http from 'http';
import * as path from 'path';
import { IMainContext } from '../core-types';
import {
  expectedErrorPlugin,
  generateApolloContext,
  wrapApolloResolvers,
} from './apollo';
import { initApiHandlers, TApiHandler } from './initApiHandlers';
import { initPluginMeta, IPluginMeta } from './initPluginMeta';
import { closeMongooose } from './mongo';
import './sentry-instrument';
import { joinErxesGateway, leaveErxesGateway } from './service-discovery';
import { createTRPCContext } from './trpc';
import { applyTrustProxy } from './utils';

export const MAX_HEADER_BYTES = 64 * 1024;

dotenv.config();

type ResolverObject = {
  [key: string]: (...args: any[]) => any;
};

type GraphqlResolver = {
  [key: string]: ResolverObject | GraphQLScalarType;
};

type ConfigTypes = {
  name: string;
  port: number;
  /**
   * Omit for a plugin with no GraphQL API (REST over `/pl:<name>` only).
   * List it in ENABLED_PLUGINS_NO_GRAPHQL so the gateway leaves it out of
   * the supergraph instead of waiting for its `/graphql`.
   */
  graphql?: () => Promise<{
    resolvers: GraphqlResolver;
    typeDefs: DocumentNode;
  }>;
  expressRouter?: Router;
  // Mounted before the shared body parsers, for routes that parse their own
  // bodies with a tighter limit.
  routerBeforeBodyParsers?: Router;
  apolloServerContext?: (
    subdomain: string,
    context: any,
    req: ApiRequest,
    res: ApiResponse,
  ) => Promise<IMainContext>;
  onServerInit?: (app: express.Express) => Promise<void>;
  middlewares?: any;
  apiHandlers?: TApiHandler[];
  hasSubscriptions?: boolean;
  corsOptions?: any;
  subscriptionPluginPath?: any;
  trpcAppRouter?: {
    router: any;
    createContext: <TContext>(
      subdomain: string,
      context: any,
    ) => Promise<TContext>;
  };
  meta?: IPluginMeta;
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
    routerBeforeBodyParsers,
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
  } = configs || {};
  const PORT = process.env.PORT ? Number(process.env.PORT) : port;

  Sentry.getGlobalScope().setTags({
    plugin: name,
    service: name,
  });

  const app = express();
  applyTrustProxy(app);
  app.disable('x-powered-by');
  app.use(cors(corsOptions));

  if (routerBeforeBodyParsers) {
    app.use(routerBeforeBodyParsers);
  }
  app.use(
    express.json({
      limit: '15mb',
      verify: (req: any, _res, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(cookieParser());

  // for health check
  app.get('/health', async (_req, res) => {
    res.end('ok');
  });

  app.get('/debug-sentry', () => {
    throw new Error('Sentry test error: ' + new Date().toISOString());
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
    initApiHandlers(app, apiHandlers);
  }

  if (hasSubscriptions) {
    if (!subscriptionPluginPath) {
      throw new Error(
        'subscriptionPluginPath is required when hasSubscriptions is true',
      );
    }

    /**
     * Protects the public subscription bundle endpoint from request floods.
     *
     * The limit is intentionally generous so regular page loads, retries, and
     * normal multi-user traffic are not blocked. It only throttles abnormal
     * high-frequency bursts from the same IP.
     */
    const subscriptionFileLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again later.',
    });

    app.get('/subscriptionPlugin.js', subscriptionFileLimiter, (_req, res) => {
      res.sendFile(path.resolve(subscriptionPluginPath));
    });
  }

  if (trpcAppRouter) {
    const { router, createContext } = trpcAppRouter;
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        allowMethodOverride: true,
        router,
        createContext: createTRPCContext(createContext),
      }),
    );
  }

  app.use((req: any, _res, next) => {
    if (req.rawBody === undefined) {
      req.rawBody = '';

      req.on('data', (chunk: any) => {
        req.rawBody += chunk.toString();
      });
    }

    next();
  });

  // Error handling middleware
  // app.use((error: any, _req: any, res: any) => {
  //   const msg = filterXSS(error.message);

  //   // debugError(`Error: ${msg}`);

  //   res.status(500).send(msg);
  // });

  const httpServer = http.createServer(
    { maxHeaderSize: MAX_HEADER_BYTES },
    app,
  );
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

  const generateApolloServer = async (
    loadSchema: NonNullable<ConfigTypes['graphql']>,
  ) => {
    const { typeDefs, resolvers } = await loadSchema();

    return new ApolloServer({
      schema: buildSubgraphSchema([
        {
          typeDefs,
          resolvers: wrapApolloResolvers(resolvers as any),
        },
      ]),

      // for graceful shutdown
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        expectedErrorPlugin,
      ],
    });
  };

  const hasGraphql = Boolean(graphql);

  if (graphql) {
    if (!apolloServerContext) {
      throw new Error('apolloServerContext is required when graphql is set');
    }

    const apolloServer = await generateApolloServer(graphql);
    await apolloServer.start();

    app.use(
      '/graphql',
      expressMiddleware(apolloServer, {
        context: generateApolloContext<IMainContext>(apolloServerContext),
      }),
    );
  }

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve),
  );

  console.log(
    hasGraphql
      ? `🚀 ${name} graphql api ready at http://localhost:${PORT}/graphql`
      : `🚀 ${name} api ready at http://localhost:${PORT} (no graphql)`,
  );

  await joinErxesGateway({
    name,
    port: PORT,
    hasSubscriptions,
    hasGraphql,
    meta,
  });

  if (meta) {
    await initPluginMeta(app, name, meta);
  } // end meta if

  if (onServerInit) {
    onServerInit(app);
  }

  //   applyInspectorEndpoints(name);

  //   debugInfo(`${name} server is running on port: ${PORT}`);

  Sentry.setupExpressErrorHandler(app);

  return app;
}

export default startPlugin;
