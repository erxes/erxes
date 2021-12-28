import * as dotenv from 'dotenv';
dotenv.config();

import { ApolloServer } from "apollo-server-express";
import { ApolloGateway } from "@apollo/gateway";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
// import ws from "ws";
import express from "express";
import http from "http";
// import { loadSubscriptions } from "./subscription";
import { getAvailableServiceList } from './subgraphs';

(async () => {
  const gatewayConfig = {
    serviceList: getAvailableServiceList(),
    experimental_pollInterval: 60*1000,
  };

  if(process.env.NODE_ENV === 'development') {
    gatewayConfig.experimental_pollInterval = 30*1000; // 30 seconds
  }

  const gateway = new ApolloGateway(gatewayConfig);

  const app = express();

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
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  const port = process.env.port || 4000;

  await new Promise<void>((resolve) =>
    httpServer.listen({ port }, resolve)
  );
  console.log(
    `Erxes gateway ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
})();
