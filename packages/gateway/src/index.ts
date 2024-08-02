import * as dotenv from "dotenv";
dotenv.config();

import "./instrument";
import * as http from "http";
import * as cookieParser from "cookie-parser";
import userMiddleware from "./middlewares/userMiddleware";
import pubsub from "./subscription/pubsub";
import {
  setAfterMutations,
  setBeforeResolvers,
  setAfterQueries
} from "./redis";
import * as cors from "cors";
import { retryGetProxyTargets, ErxesProxyTarget } from "./proxy/targets";
import { applyProxiesCoreless, applyProxyToCore } from "./proxy/middleware";
import { startRouter, stopRouter } from "./apollo-router";
import {
  startSubscriptionServer,
  stopSubscriptionServer
} from "./subscription";
import { applyInspectorEndpoints } from "@erxes/api-utils/src/inspect";
import app from "@erxes/api-utils/src/app";
import { sanitizeHeaders } from "@erxes/api-utils/src/headers";
import { applyGraphqlLimiters } from "./middlewares/graphql-limiter";
import * as Sentry from "@sentry/node";

const { DOMAIN, WIDGETS_DOMAIN, CLIENT_PORTAL_DOMAINS, ALLOWED_ORIGINS, PORT } =
  process.env;

(async () => {
  app.use((req, _res, next) => {
    sanitizeHeaders(req.headers);
    next();
  });

  app.use(cookieParser());

  app.use(userMiddleware);

  const corsOptions = {
    credentials: true,
    origin: [
      DOMAIN ? DOMAIN : "http://localhost:3000",
      WIDGETS_DOMAIN ? WIDGETS_DOMAIN : "http://localhost:3200",
      ...(CLIENT_PORTAL_DOMAINS || "").split(","),
      "https://studio.apollographql.com",
      ...(ALLOWED_ORIGINS || "").split(",").map(c => c && RegExp(c))
    ]
  };

  app.use(cors(corsOptions));

  const targets: ErxesProxyTarget[] = await retryGetProxyTargets();

  await startRouter(targets);

  Sentry.setupExpressErrorHandler(app);
  applyGraphqlLimiters(app);
  applyProxiesCoreless(app, targets);

  const httpServer = http.createServer(app);

  httpServer.on("close", () => {
    try {
      pubsub.close();
    } catch (e) {
      console.log("PubSub client disconnected");
    }
  });

  await startSubscriptionServer(httpServer);

  applyInspectorEndpoints("gateway");

  const port = PORT || 4000;

  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));

  await setBeforeResolvers();
  await setAfterMutations();
  await setAfterQueries();

  await applyProxyToCore(app, targets);

  console.log(`Erxes gateway ready at http://localhost:${port}/`);
})();

(["SIGINT", "SIGTERM"] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, async () => {
    console.log(`Exiting on signal ${sig}`);
    await stopSubscriptionServer();
    await stopRouter(sig);
    process.exit(0);
  });
});
