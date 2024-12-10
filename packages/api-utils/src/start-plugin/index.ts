import * as dotenv from "dotenv";
dotenv.config();

import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as express from "express";
import { filterXSS } from "xss";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import * as cookieParser from "cookie-parser";
import { debugInfo, debugError } from "../debuggers";
import * as http from "http";
import { connectToMessageBroker } from "@erxes/api-utils/src/messageBroker";
import { getSubdomain } from "@erxes/api-utils/src/core";
import * as path from "path";
import * as ws from "ws";

import {
  getServices,
  join,
  leave
} from "@erxes/api-utils/src/serviceDiscovery";
import { applyInspectorEndpoints } from "../inspect";
import app from "@erxes/api-utils/src/app";
import { consumeQueue, consumeRPCQueue } from "../messageBroker";
import { extractUserFromHeader } from "../headers";
import { formConsumers } from "../consumers/forms";
import { tagConsumers } from "../consumers/tags";
import { internalNoteConsumers } from "../consumers/internalNotes";
import { logConsumers } from "../consumers/logs";
import { importExportCunsomers } from "../consumers/importExport";
import { automationsCunsomers } from "../consumers/automations";
import { documentsCunsomer } from "../consumers/documents";
import { cronjobCunsomers } from "../consumers/cronjobs";
import { searchCunsomers } from "../consumers/search";
import { templatesCunsomers } from "../consumers/templates";
import { segmentsCunsomers } from "../consumers/segments";
import { reportsCunsomers } from "../consumers/reports";

const { PORT, USE_BRAND_RESTRICTIONS } = process.env;

app.use(bodyParser.json({ limit: "15mb" }));
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));

export async function startPlugin(configs: any): Promise<express.Express> {
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

  app.use(cors(configs.corsOptions || {}));

  app.use(cookieParser());

  if (configs.hasSubscriptions) {
    app.get("/subscriptionPlugin.js", async (req, res) => {
      res.sendFile(path.join(configs.subscriptionPluginPath));
    });
  }

  app.use((req: any, _res, next) => {
    req.rawBody = "";

    req.on("data", chunk => {
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
      await leave(configs.name, PORT || "");
      console.log(`Left service discovery. name=${configs.name} port=${PORT}`);
    } catch (e) {
      console.error(e);
    }
  }

  // If the Node process ends, close the Mongoose connection
  (["SIGINT", "SIGTERM"] as NodeJS.Signals[]).forEach(sig => {
    process.on(sig, async () => {
      await closeHttpServer();
      await leaveServiceDiscovery();
      process.exit(0);
    });
  });

  const generateApolloServer = async () => {
    const services = await getServices();
    debugInfo(`Enabled services .... ${JSON.stringify(services)}`);

    const { typeDefs, resolvers } = await configs.graphql();

    return new ApolloServer({
      schema: buildSubgraphSchema([
        {
          typeDefs,
          resolvers
        }
      ]),

      // for graceful shutdown
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
    });
  };

  const apolloServer = await generateApolloServer();
  await apolloServer.start();

  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        if (
          req.body.operationName === "IntrospectionQuery" ||
          req.body.operationName === "SubgraphIntrospectQuery"
        ) {
          return {};
        }
        let user: any = extractUserFromHeader(req.headers);

        let context;

        if (USE_BRAND_RESTRICTIONS !== "true") {
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
          let scopeBrandIds = JSON.parse(req.cookies.scopeBrandIds || "[]");
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
    })
  );

  await new Promise<void>(resolve =>
    httpServer.listen({ port: PORT }, resolve)
  );

  if (configs.freeSubscriptions) {
    const wsServer = new ws.Server({
      server: httpServer,
      path: "/subscriptions"
    });

    await configs.freeSubscriptions(wsServer);
  }

  console.log(
    `🚀 ${configs.name} graphql api ready at http://localhost:${PORT}/graphql`
  );

  await connectToMessageBroker(configs.setupMessageConsumers);

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
      payment,
      reports,
      templates,
      cpCustomerHandle,
      loyalties
    } = configs.meta;

    const logs = configs.meta.logs && configs.meta.logs.consumers;

    if (segments) {
      segmentsCunsomers({ name: configs.name, segments });
    }

    if (logs) {
      logConsumers({
        name: configs.name,
        logs
      });
    }

    if (forms) {
      formConsumers({ name: configs.name, forms });
    }

    if (tags) {
      tagConsumers({ name: configs.name, tags });
    }

    if (webhooks) {
      if (webhooks.getInfo) {
        webhooks.getInfoAvailable = true;

        consumeRPCQueue(`${configs.name}:webhooks.getInfo`, async args => ({
          status: "success",
          data: await webhooks.getInfo(args)
        }));
      }
    }

    if (internalNotes) {
      internalNoteConsumers({
        name: configs.name,
        internalNotes
      });
    }

    importExportCunsomers({ name: configs.name, imports, exporter });

    if (automations) {
      automationsCunsomers({ name: configs.name, automations });
    }

    if (reports) {
      reportsCunsomers({ name: configs.name, reports });
    }

    if (templates) {
      templatesCunsomers({ name: configs.name, templates });
    }

    if (initialSetup) {
      if (initialSetup.generate) {
        initialSetup.generateAvailable = true;

        consumeQueue(`${configs.name}:initialSetup`, async args => ({
          status: "success",
          data: await initialSetup.generate(args)
        }));

        app.post("/initial-setup", async (req, res) => {
          await initialSetup.generate({ subdomain: getSubdomain(req) });
          return res.end("ok");
        });
      }
    }

    if (search) {
      configs.meta.isSearchable = true;

      searchCunsomers({ name: configs.name, search });
    }

    if (cronjobs) {
      cronjobCunsomers({ name: configs.name, cronjobs });
    }

    if (documents) {
      documentsCunsomer({ name: configs.name, documents });
    }

    if (readFileHook) {
      readFileHook.isAvailable = true;

      consumeRPCQueue(`${configs.name}:readFileHook`, async args => ({
        status: "success",
        data: await readFileHook.action(args)
      }));
    }

    if (documentPrintHook) {
      documentPrintHook.isAvailable = true;

      consumeRPCQueue(`${configs.name}:documentPrintHook`, async args => ({
        status: "success",
        data: await documentPrintHook.action(args)
      }));
    }

    if (payment) {
      if (payment.callback) {
        payment.callbackAvailable = true;
        consumeQueue(`${configs.name}:paymentCallback`, async args => ({
          status: "success",
          data: await payment.callback(args)
        }));
      }

      if (payment.transactionCallback) {
        payment.transactionCallbackAvailable = true;
        consumeQueue(
          `${configs.name}:paymentTransactionCallback`,
          async args => ({
            status: "success",
            data: await payment.transactionCallback(args)
          })
        );
      }
    }

    if (cpCustomerHandle) {
      consumeQueue(`${configs.name}:cpCustomerHandle`, async args => ({
        status: "success",
        data: await cpCustomerHandle.cpCustomerHandle(args)
      }));
    }

    if (loyalties) {
      if (loyalties.getScoreCampaingAttributes) {
        loyalties.aviableAttributes = true;

        consumeRPCQueue(
          `${configs.name}:getScoreCampaingAttributes`,
          async args => ({
            status: "success",
            data: await loyalties.getScoreCampaingAttributes(args)
          })
        );
      }
    }
  } // end configs.meta if

  await join({
    name: configs.name,
    port: PORT || "",
    hasSubscriptions: configs.hasSubscriptions,
    importExportTypes: configs.importExportTypes,
    meta: configs.meta
  });

  configs.onServerInit();

  applyInspectorEndpoints(configs.name);

  debugInfo(`${configs.name} server is running on port: ${PORT}`);

  return app;
}

export default startPlugin;
