import * as dotenv from "dotenv";
dotenv.config();

import { ApolloServer, ExpressContext } from "apollo-server-express";
import { ApolloGateway } from "@apollo/gateway";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { createProxyMiddleware } from "http-proxy-middleware";
import ws from "ws";
import express from "express";
import http from "http";
import { loadSubscriptions } from "./subscription";
import { createGateway, GatewayContext } from "./gateway";

(async () => {

  const app = express();

  // TODO: Find some solution so that we can stop forwarding /read-file, /initialSetup etc.
  app.use(
    /\/((?!graphql).)*/,
    createProxyMiddleware({ target: process.env.API_DOMAIN })
  );

  const httpServer = http.createServer(app);

  const wsServer = new ws.Server({
    server: httpServer,
    path: "/graphql",
  });

  const gateway: ApolloGateway = createGateway();

  const apolloServer = new ApolloServer({
    gateway,
    // for graceful shutdowns
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ res, req }: ExpressContext): GatewayContext => ({ res, req })
  });

  gateway.onSchemaLoadOrUpdate(({ apiSchema }) =>
    loadSubscriptions(apiSchema, wsServer)
  );

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    path: "/graphql",
    cors: {
      credentials: true,
      origin: [ process.env.MAIN_APP_DOMAIN || "http://localhost:3000", "https://studio.apollographql.com", "http://localhost:3200"],
    },
  });  

  const port = process.env.PORT || 4000;

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `Erxes gateway ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
})();
