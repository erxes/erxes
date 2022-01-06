const { makeSubscriptionSchema } = require("esm")(module)(
  "federation-subscription-tools"
);

import { useServer } from "graphql-ws/lib/use/ws";
import {
  execute,
  getOperationAST,
  GraphQLError,
  parse,
  subscribe,
  validate,
} from "graphql";
import ws from "ws";
import { GraphQLSchema } from "graphql";
import GatewayDataSource from "./GatewayDataSource";
import resolvers from "./resolvers";
import typeDefs from './typeDefs';

export function loadSubscriptions(
  gatewaySchema: GraphQLSchema,
  wsServer: ws.Server
) {
  const schema = makeSubscriptionSchema({ gatewaySchema, typeDefs, resolvers });
  useServer(
    {
      execute,
      subscribe,
      context: (ctx, msg, args) => {
        // Instantiate and initialize the GatewayDataSource subclass
        // (data source methods will be accessible on the `gatewayApi` key)
        const gatewayDataSource = new GatewayDataSource("http://localhost:4000/graphql");
        gatewayDataSource.initialize({ context: ctx, cache: undefined });

        // Return the complete context for the request
        return { dataSources: { gatewayDataSource } };
      },
      onSubscribe: (_ctx, msg) => {
        // Construct the execution arguments
        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
        };

        const operationAST = getOperationAST(args.document, args.operationName);

        // Stops the subscription and sends an error message
        if (!operationAST) {
          return [new GraphQLError("Unable to identify operation")];
        }

        // Handle mutation and query requests
        if (operationAST.operation !== "subscription") {
          return [
            new GraphQLError("Only subscription operations are supported"),
          ];
        }

        // Validate the operation document
        const errors = validate(args.schema, args.document);

        if (errors.length > 0) {
          return errors;
        }
        // Ready execution arguments
        return args;
      },
    },
    wsServer
  );
}
