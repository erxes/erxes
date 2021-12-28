import * as dotenv from "dotenv";
dotenv.config();

import { ApolloServer } from "apollo-server-express";
import { ApolloGateway, GatewayConfig } from "@apollo/gateway";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { createProxyMiddleware } from "http-proxy-middleware";
// import ws from "ws";
import express from "express";
import http from "http";
// import { loadSubscriptions } from "./subscription";
import { getConfiguredServices } from "./subgraphs";

(async () => {
  const gatewayConfig: GatewayConfig = {
    serviceList: getConfiguredServices(),
  };

  if (process.env.NODE_ENV === "development") {
    gatewayConfig.experimental_pollInterval = 30 * 1000; // 30 seconds
  }

  const gateway = new ApolloGateway(gatewayConfig);

  const app = express();

  app.use(
    /\/((?!graphql).)*/,
    createProxyMiddleware({ target: process.env.FORWARD_EXCEPT_GRAPHQL_URL })
  );

  const httpServer = http.createServer(app);

  // const wsServer = new ws.Server({
  //   server: httpServer,
  //   path: "/graphql",
  // });

  const apolloServer = new ApolloServer({
    gateway,
    // for graceful shutdowns
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // gateway.onSchemaLoadOrUpdate(({ apiSchema }) =>
  //   loadSubscriptions(apiSchema, wsServer, apolloServer)
  // );

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    path: "/graphql",
    cors: {
      credentials: true,
      origin: [ process.env.MAIN_APP_DOMAIN || "http://localhost:3000", "https://studio.apollographql.com"],
    },
  });

  

  const port = process.env.PORT || 4000;

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `Erxes gateway ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
})();
