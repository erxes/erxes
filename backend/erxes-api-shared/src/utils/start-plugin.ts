import './sentry-instrument';
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
import rateLimit from 'express-rate-limit';
import {
  registerPayments,
  startPaymentsWorker,
} from '../common-modules/payment/worker';
import type { IContactFieldsMeta } from '../core-modules/contact-fields';
import {
  type IAgentPluginMeta,
  validateAgentPluginMeta,
} from '../core-modules/agent';
import type {
  IPropertyMeta,
  LogsConfigs,
  SegmentConfigs,
  TApprovalConfig,
  TRecordReferencesConfig,
} from '../core-modules';
import {
  initApproval,
  initPropertyProducers,
  initRecordReferences,
  initSegmentProducers,
  startAutomations,
} from '../core-modules';
import { AutomationConfigs } from '../core-modules/automations/types';
import type { ImportExportConfigs } from '../core-modules/import-export/types';
import {
  mountImportExportRoute,
  startImportExportWorkers,
} from '../core-modules/import-export/worker';
import { IMainContext, IPermissionConfig } from '../core-types';
import {
  generateApolloContext,
  startBeforeResolvers,
  wrapApolloResolvers,
  expectedErrorPlugin,
} from './apollo';
import { BeforeResolversConfig } from './apollo/beforeResolvers';
import { extractUserFromHeader } from './headers';
import { AfterProcessConfigs, logHandler, startAfterProcess } from './logs';
import { closeMongooose } from './mongo';
import {
  initializePluginConfig,
  joinErxesGateway,
  leaveErxesGateway,
} from './service-discovery';
import { readServiceRole } from './service-role';
import { createTRPCContext } from './trpc';
import { applyTrustProxy, getSubdomain } from './utils';
import * as Sentry from '@sentry/node';

export const MAX_HEADER_BYTES = 64 * 1024;

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
  documents?: {
    types: {
      label: string;
      contentType: string;
    }[];
  };
  properties?: IPropertyMeta;
  references?: TRecordReferencesConfig;
  approval?: TApprovalConfig;
  permissions?: IPermissionConfig;
  beforeResolvers?: BeforeResolversConfig;
  importExport?: ImportExportConfigs;
  relations?: {
    subscribedTypes: string[];
  };
  // Record types keeping their own customerId / companyId; core tells the
  // plugin when a contact is merged or removed (tRPC `contactFields.sync`).
  contactFields?: IContactFieldsMeta;
  // Text-only skills and agent-hidden GraphQL operations for the core AI
  // assistant; core re-validates them when it reads service discovery.
  agent?: IAgentPluginMeta;
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
  // Runs with SERVICE_ROLE all | api.
  onServerInit?: (app: express.Express) => Promise<void>;
  // Queue consumers; runs with SERVICE_ROLE all | worker. Workers left in
  // onServerInit keep running in the api process.
  onWorkerInit?: () => Promise<void>;
  middlewares?: any;
  apiHandlers?: ApiHandler[];
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
  meta?: IMeta;
};

const mountApiRoutes = (
  app: express.Express,
  {
    corsOptions = {},
    expressRouter,
    middlewares,
    apiHandlers,
    hasSubscriptions,
    subscriptionPluginPath,
    trpcAppRouter,
  }: ConfigTypes,
) => {
  app.use(cors(corsOptions));
  app.use(
    express.json({
      limit: '15mb',
      verify: (req: any, _res, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(cookieParser());

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
};

const mountGraphql = async (
  app: express.Express,
  httpServer: http.Server,
  { graphql, apolloServerContext }: ConfigTypes,
) => {
  const { typeDefs, resolvers } = await graphql();

  const apolloServer = new ApolloServer({
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

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: generateApolloContext<IMainContext>(apolloServerContext),
    }),
  );
};

// Publishes the plugin's meta to service discovery and mounts its producer routes.
const initMetaProducers = async (
  app: express.Express,
  name: string,
  meta: IMeta,
) => {
  const {
    automations,
    segments,
    afterProcess,
    notifications,
    payments,
    beforeResolvers,
    references,
    importExport,
    approval,
    properties,
    agent,
  } = meta;

  for (const { skill, reason } of validateAgentPluginMeta(agent).rejections) {
    console.warn(
      `[agent] ${name} ${
        skill ? `skill "${skill}"` : 'metadata'
      } ignored: ${reason}`,
    );
  }

  if (beforeResolvers) {
    await startBeforeResolvers(app, name, beforeResolvers);
  }

  if (afterProcess) {
    await startAfterProcess(app, name, afterProcess);
  }

  if (references) {
    await initRecordReferences(app, name, references);
  }

  if (approval) {
    await initApproval(app, name, approval);
  }

  if (automations) {
    await startAutomations(app, name, automations);
  }

  if (segments) {
    await initSegmentProducers(app, name, segments);
  }

  if (properties?.valueUsage) {
    initPropertyProducers(app, properties.valueUsage);
  }

  if (notifications) {
    await initializePluginConfig(name, 'notifications', notifications);
  }

  if (importExport) {
    mountImportExportRoute({ pluginName: name, config: importExport, app });
  }

  if (payments) {
    await registerPayments(name, payments);
  }
};

const startMetaWorkers = async (name: string, meta: IMeta) => {
  const { importExport, payments } = meta;

  if (importExport) {
    startImportExportWorkers({ pluginName: name, config: importExport });
  }

  if (payments) {
    await startPaymentsWorker(name, payments);
  }
};

export async function startPlugin(
  configs: ConfigTypes,
): Promise<express.Express> {
  const { name, port, hasSubscriptions, onServerInit, onWorkerInit, meta } =
    configs || {};
  const PORT = process.env.PORT ? Number(process.env.PORT) : port;
  const { role, runsApi, runsWorkers } = readServiceRole();

  Sentry.getGlobalScope().setTags({
    plugin: name,
    service: runsApi ? name : `${name}-worker`,
  });

  const app = express();
  applyTrustProxy(app);
  app.disable('x-powered-by');

  // for health check; a worker answers nothing else
  app.get('/health', async (_req, res) => {
    res.end('ok');
  });

  if (runsApi) {
    mountApiRoutes(app, configs);
  }

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

      // A worker never joined the gateway.
      if (runsApi) {
        await leaveServiceDiscovery();
      }

      process.exit(0);
    });
  });

  if (runsApi) {
    await mountGraphql(app, httpServer, configs);
  }

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve),
  );

  if (runsApi) {
    console.log(
      `🚀 ${name} graphql api ready at http://localhost:${PORT}/graphql`,
    );

    await joinErxesGateway({
      name,
      port: PORT,
      hasSubscriptions,
      meta,
    });

    if (meta) {
      await initMetaProducers(app, name, meta);
    }

    if (onServerInit) {
      onServerInit(app);
    }
  } else {
    // The gateway routes to the plugin's Service name, not to this pod.
    console.log(
      `[${name}] SERVICE_ROLE=${role}: not joining the gateway; keep this pod out of the api Service selector`,
    );
  }

  if (runsWorkers) {
    if (meta) {
      await startMetaWorkers(name, meta);
    }

    if (onWorkerInit) {
      await onWorkerInit();
    }
  }

  Sentry.setupExpressErrorHandler(app);

  return app;
}

export default startPlugin;
