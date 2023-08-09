import * as dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

// load environment variables
dotenv.config({ path: '../.env' });

import * as cors from 'cors';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import { filterXSS } from 'xss';
import { buildSubgraphSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server-express';
import * as cookieParser from 'cookie-parser';

import * as http from 'http';

import { connect } from './connection';
import { debugInfo, debugError } from './debuggers';
import { init as initBroker } from '@erxes/api-utils/src/messageBroker';
import { logConsumers } from '@erxes/api-utils/src/logUtils';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { internalNoteConsumers } from '@erxes/api-utils/src/internalNotes';
import pubsub from './pubsub';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import * as path from 'path';
import * as ws from 'ws';

import {
  getService,
  getServices,
  isAvailable,
  isEnabled,
  join,
  leave,
  redis
} from '@erxes/api-utils/src/serviceDiscovery';

const configs = require('../../src/configs').default;

const {
  MONGO_URL,
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX,
  PORT,
  USE_BRAND_RESTRICTIONS,
  SENTRY_DSN
} = process.env;

export const app = express();

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

app.use(bodyParser.json({ limit: '15mb' }));
app.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));

if (configs.middlewares) {
  for (const middleware of configs.middlewares) {
    app.use(middleware);
  }
}

if (configs.postHandlers) {
  for (const handler of configs.postHandlers) {
    if (handler.path && handler.method) {
      app.post(handler.path, handler.method);
    }
  }
}

if (configs.getHandlers) {
  for (const handler of configs.getHandlers) {
    if (handler.path && handler.method) {
      app.get(handler.path, handler.method);
    }
  }
}

app.disable('x-powered-by');

app.use(cors());

app.use(cookieParser());

// for health checking
app.get('/health', async (_req, res) => {
  res.end('ok');
});

if (configs.hasSubscriptions) {
  app.get('/subscriptionPlugin.js', async (req, res) => {
    res.sendFile(
      path.join(__dirname, '../../src/graphql/subscriptionPlugin.js')
    );
  });
}

if (configs.hasDashboard) {
  if (configs.hasDashboard) {
    app.get('/dashboard', async (req, res) => {
      const headers = req.rawHeaders;

      const index = headers.indexOf('schemaName') + 1;

      const schemaName = headers[index];

      res.sendFile(
        path.join(__dirname, `../../src/dashboardSchemas/${schemaName}.js`)
      );
    });
  }
}

app.use((req: any, _res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk.toString();
  });

  next();
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  const msg = filterXSS(error.message);

  debugError(`Error: ${msg}`);

  res.status(500).send(msg);
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

const httpServer = http.createServer(app);

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
    await leave(configs.name, PORT || '');
    console.log(`Left service discovery. name=${configs.name} port=${PORT}`);
  } catch (e) {
    console.error(e);
  }
}

// If the Node process ends, close the Mongoose connection
(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, async () => {
    await closeHttpServer();
    await leaveServiceDiscovery();
    process.exit(0);
  });
});

const generateApolloServer = async serviceDiscovery => {
  const services = await getServices();
  debugInfo(`Enabled services .... ${JSON.stringify(services)}`);

  const { typeDefs, resolvers } = await configs.graphql(serviceDiscovery);

  return new ApolloServer({
    schema: buildSubgraphSchema([
      {
        typeDefs,
        resolvers
      }
    ]),

    // for graceful shutdown
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: async ({ req, res }) => {
      let user: any = null;

      if (req.headers.user) {
        if (Array.isArray(req.headers.user)) {
          throw new Error(`Multiple user headers`);
        }
        const userJson = Buffer.from(req.headers.user, 'base64').toString(
          'utf-8'
        );
        user = JSON.parse(userJson);
      }

      let context;

      if (USE_BRAND_RESTRICTIONS !== 'true') {
        context = {
          brandIdSelector: {},
          singleBrandIdSelector: {},
          userBrandIdsSelector: {},
          docModifier: doc => doc,
          commonQuerySelector: {},
          user,
          res
        };
      } else {
        let scopeBrandIds = JSON.parse(req.cookies.scopeBrandIds || '[]');
        let brandIds = [];
        let brandIdSelector = {};
        let commonQuerySelector = {};
        let commonQuerySelectorElk;
        let userBrandIdsSelector = {};
        let singleBrandIdSelector = {};

        if (user) {
          brandIds = user.brandIds || [];

          if (scopeBrandIds.length === 0) {
            scopeBrandIds = brandIds;
          }

          if (!user.isOwner && scopeBrandIds.length > 0) {
            brandIdSelector = { _id: { $in: scopeBrandIds } };
            commonQuerySelector = { scopeBrandIds: { $in: scopeBrandIds } };
            commonQuerySelectorElk = { terms: { scopeBrandIds } };
            userBrandIdsSelector = { brandIds: { $in: scopeBrandIds } };
            singleBrandIdSelector = { brandId: { $in: scopeBrandIds } };
          }
        }

        context = {
          brandIdSelector,
          singleBrandIdSelector,
          docModifier: doc => ({ ...doc, scopeBrandIds }),
          commonQuerySelector,
          commonQuerySelectorElk,
          userBrandIdsSelector,
          user,
          res
        };
      }

      await configs.apolloServerContext(context, req, res);

      return context;
    }
  });
};

async function startServer() {
  const serviceDiscovery = {
    getServices,
    getService,
    isAvailable,
    isEnabled
  };

  const apolloServer = await generateApolloServer(serviceDiscovery);
  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    path: '/graphql',
    cors: configs.corsOptions || {}
  });

  await new Promise<void>(resolve =>
    httpServer.listen({ port: PORT }, resolve)
  );

  if (configs.freeSubscriptions) {
    const wsServer = new ws.Server({
      server: httpServer,
      path: '/subscriptions'
    });

    await configs.freeSubscriptions(wsServer);
  }

  console.log(
    `🚀 ${configs.name} graphql api ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  );

  const mongoUrl = MONGO_URL || '';

  // connect to mongo database
  const db = await connect(mongoUrl);

  const messageBrokerClient = await initBroker({
    RABBITMQ_HOST,
    MESSAGE_BROKER_PREFIX,
    redis
  });

  if (configs.permissions) {
    await messageBrokerClient.sendMessage(
      'registerPermissions',
      configs.permissions
    );
  }

  if (configs.meta) {
    const {
      segments,
      forms,
      tags,
      imports,
      internalNotes,
      automations,
      search,
      webhooks,
      initialSetup,
      cronjobs,
      documents,
      exporter,
      documentPrintHook,
      readFileHook,
      payment
    } = configs.meta;

    const { consumeRPCQueue, consumeQueue } = messageBrokerClient;

    const logs = configs.meta.logs && configs.meta.logs.consumers;

    if (segments) {
      if (segments.propertyConditionExtender) {
        segments.propertyConditionExtenderAvailable = true;

        consumeRPCQueue(
          `${configs.name}:segments.propertyConditionExtender`,
          segments.propertyConditionExtender
        );
      }

      if (segments.associationFilter) {
        segments.associationFilterAvailable = true;

        consumeRPCQueue(
          `${configs.name}:segments.associationFilter`,
          segments.associationFilter
        );
      }

      if (segments.esTypesMap) {
        segments.esTypesMapAvailable = true;

        consumeRPCQueue(
          `${configs.name}:segments.esTypesMap`,
          segments.esTypesMap
        );
      }

      if (segments.initialSelector) {
        segments.initialSelectorAvailable = true;

        consumeRPCQueue(
          `${configs.name}:segments.initialSelector`,
          segments.initialSelector
        );
      }
    }

    if (logs) {
      logConsumers({
        name: configs.name,
        consumeRPCQueue,
        getActivityContent: logs.getActivityContent,
        getContentTypeDetail: logs.getContentTypeDetail,
        collectItems: logs.collectItems,
        getContentIds: logs.getContentIds,
        getSchemalabels: logs.getSchemaLabels
      });
    }

    if (forms) {
      if (forms.fields) {
        consumeRPCQueue(`${configs.name}:fields.getList`, async args => ({
          status: 'success',
          data: await forms.fields(args)
        }));
      }

      if (forms.groupsFilter) {
        consumeRPCQueue(`${configs.name}:fields.groupsFilter`, async args => ({
          status: 'success',
          data: await forms.groupsFilter(args)
        }));
      }

      if (forms.systemFields) {
        forms.systemFieldsAvailable = true;

        consumeRPCQueue(`${configs.name}:systemFields`, async args => ({
          status: 'success',
          data: await forms.systemFields(args)
        }));
      }

      if (forms.fieldsGroupsHook) {
        forms.groupsHookAvailable = true;

        consumeRPCQueue(`${configs.name}:fieldsGroupsHook`, async args => ({
          status: 'success',
          data: await forms.fieldsGroupsHook(args)
        }));
      }

      if (forms.relations) {
        forms.relationsAvailable = true;

        consumeRPCQueue(`${configs.name}:relations`, async args => ({
          status: 'success',
          data: await forms.relations(args)
        }));
      }
    }

    if (tags) {
      if (tags.tag) {
        consumeRPCQueue(`${configs.name}:tag`, async args => ({
          status: 'success',
          data: await tags.tag(args)
        }));
      }

      if (tags.publishChange) {
        tags.publishChangeAvailable = true;

        consumeRPCQueue(`${configs.name}:publishChange`, async args => ({
          status: 'success',
          data: await tags.publishChange(args)
        }));
      }
      if (tags.fixRelatedItems) {
        consumeRPCQueue(`${configs.name}:fixRelatedItems`, async args => ({
          status: 'success',
          data: await tags.fixRelatedItems(args)
        }));
      }
    }

    if (webhooks) {
      if (webhooks.getInfo) {
        webhooks.getInfoAvailable = true;

        consumeRPCQueue(`${configs.name}:webhooks.getInfo`, async args => ({
          status: 'success',
          data: await webhooks.getInfo(args)
        }));
      }
    }

    if (internalNotes) {
      internalNoteConsumers({
        name: configs.name,
        consumeRPCQueue,
        generateInternalNoteNotif: internalNotes.generateInternalNoteNotif
      });
    }

    if (imports) {
      if (imports.prepareImportDocs) {
        consumeRPCQueue(
          `${configs.name}:imports:prepareImportDocs`,
          async args => ({
            status: 'success',
            data: await imports.prepareImportDocs(args)
          })
        );
      }

      if (imports.insertImportItems) {
        consumeRPCQueue(
          `${configs.name}:imports:insertImportItems`,
          async args => ({
            status: 'success',
            data: await imports.insertImportItems(args)
          })
        );
      }
    }

    if (exporter) {
      if (exporter.prepareExportData) {
        consumeRPCQueue(
          `${configs.name}:exporter:prepareExportData`,
          async args => ({
            status: 'success',
            data: await exporter.prepareExportData(args)
          })
        );
      }

      if (exporter.getExportDocs) {
        consumeRPCQueue(
          `${configs.name}:exporter:getExportDocs`,
          async args => ({
            status: 'success',
            data: await exporter.getExportDocs(args)
          })
        );
      }
    }

    if (automations) {
      if (automations.receiveActions) {
        consumeRPCQueue(
          `${configs.name}:automations.receiveActions`,
          async args => ({
            status: 'success',
            data: await automations.receiveActions(args)
          })
        );
      }
    }

    if (initialSetup) {
      if (initialSetup.generate) {
        initialSetup.generateAvailable = true;

        consumeQueue(`${configs.name}:initialSetup`, async args => ({
          status: 'success',
          data: await initialSetup.generate(args)
        }));

        app.post('/initial-setup', async (req, res) => {
          await initialSetup.generate({ subdomain: getSubdomain(req) });
          return res.end('ok');
        });
      }
    }

    if (search) {
      configs.meta.isSearchable = true;

      consumeRPCQueue(`${configs.name}:search`, async args => ({
        status: 'success',
        data: await search(args)
      }));
    }

    if (cronjobs) {
      if (cronjobs.handleMinutelyJob) {
        cronjobs.handleMinutelyJobAvailable = true;

        consumeQueue(`${configs.name}:handleMinutelyJob`, async args => ({
          status: 'success',
          data: await cronjobs.handleMinutelyJob(args)
        }));
      }

      if (cronjobs.handle10MinutelyJob) {
        cronjobs.handle10MinutelyJobAvailable = true;

        consumeQueue(`${configs.name}:handle10MinutelyJob`, async args => ({
          status: 'success',
          data: await cronjobs.handle10MinutelyJob(args)
        }));
      }

      if (cronjobs.handleHourlyJob) {
        cronjobs.handleHourlyJobAvailable = true;

        consumeQueue(`${configs.name}:handleHourlyJob`, async args => ({
          status: 'success',
          data: await cronjobs.handleHourlyJob(args)
        }));
      }

      if (cronjobs.handleDailyJob) {
        cronjobs.handleDailyJobAvailable = true;

        consumeQueue(`${configs.name}:handleDailyJob`, async args => ({
          status: 'success',
          data: await cronjobs.handleDailyJob(args)
        }));
      }
    }

    if (documents) {
      consumeRPCQueue(
        `${configs.name}:documents.editorAttributes`,
        async args => ({
          status: 'success',
          data: await documents.editorAttributes(args)
        })
      );

      consumeRPCQueue(
        `${configs.name}:documents.replaceContent`,
        async args => ({
          status: 'success',
          data: await documents.replaceContent(args)
        })
      );
    }

    if (readFileHook) {
      readFileHook.isAvailable = true;

      consumeRPCQueue(`${configs.name}:readFileHook`, async args => ({
        status: 'success',
        data: await readFileHook.action(args)
      }));
    }

    if (documentPrintHook) {
      documentPrintHook.isAvailable = true;

      consumeRPCQueue(`${configs.name}:documentPrintHook`, async args => ({
        status: 'success',
        data: await documentPrintHook.action(args)
      }));
    }

    if (payment) {
      if (payment.callback) {
        payment.callbackAvailable = true;
        consumeQueue(`${configs.name}:paymentCallback`, async args => ({
          status: 'success',
          data: await payment.callback(args)
        }));
      }
    }
  } // end configs.meta if

  await join({
    name: configs.name,
    port: PORT || '',
    dbConnectionString: mongoUrl,
    hasSubscriptions: configs.hasSubscriptions,
    hasDashboard: configs.hasDashboard,
    importExportTypes: configs.importExportTypes,
    meta: configs.meta
  });

  configs.onServerInit({
    db,
    app,
    redis,
    pubsubClient: pubsub,
    messageBrokerClient,
    debug: {
      info: debugInfo,
      error: debugError
    }
  });

  debugInfo(`${configs.name} server is running on port: ${PORT}`);
}

startServer();
