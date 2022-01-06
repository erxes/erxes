import * as dotenv from "dotenv";
dotenv.config();

import { ApolloServer, ExpressContext } from "apollo-server-express";
import { ApolloGateway } from "@apollo/gateway";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { createProxyMiddleware } from "http-proxy-middleware";
// import ws from "ws";
import express, { Request, Response } from "express";
import http from "http";
import cookieParser from "cookie-parser";
// import { loadSubscriptions } from "./subscription";
import { createGateway, GatewayContext } from "./gateway";
import userMiddleware from "./middlewares/userMiddleware";
import * as db from './db';

const { MAIN_APP_DOMAIN, API_DOMAIN, PORT} = process.env;

(async () => {

  await db.connect();

  const app = express();
  app.use(cookieParser());

  // TODO: Find some solution so that we can stop forwarding /read-file, /initialSetup etc.
  app.use(
    /\/((?!graphql).)*/,
    createProxyMiddleware({ target: API_DOMAIN })
  );

  app.use(userMiddleware);

  const httpServer = http.createServer(app);

  httpServer.on("close", () => {
    db.disconnect();
  });

  // const wsServer = new ws.Server({
  //   server: httpServer,
  //   path: "/graphql",
  // });

  const gateway: ApolloGateway = createGateway();

  const apolloServer = new ApolloServer({
    gateway,
    // for graceful shutdowns
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ res, req }: { res: Response, req: Request & { user?: any }}): GatewayContext => {
      // console.log(`building context ${JSON.stringify(req.user)}`);
      return { res, req }
    }
  });

  // TODO: subscriptions don't work yet. Client's WebSocketLink, graphql version, graphql-ws needs to be updated
  // gateway.onSchemaLoadOrUpdate(({ apiSchema }) =>
  //   loadSubscriptions(apiSchema, wsServer)
  // );

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    path: "/graphql",
    cors: {
      credentials: true,
      origin: [ MAIN_APP_DOMAIN || "http://localhost:3000", "https://studio.apollographql.com", "http://localhost:3200"],
    },
  });  

  const port = PORT || 4000;

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `Erxes gateway ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
})();
