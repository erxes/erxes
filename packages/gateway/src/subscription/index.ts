const { makeSubscriptionSchema } = require("esm")(module)(
  "federation-subscription-tools"
);

import { useServer } from "graphql-ws/lib/use/ws";
import {
  execute,
  ExecutionArgs,
  getOperationAST,
  GraphQLError,
  parse,
  subscribe,
  validate,
} from "graphql";
import ws, { MessageEvent, WebSocket } from "ws";
import { GraphQLSchema } from "graphql";
import GatewayDataSource from "./GatewayDataSource";
import resolvers from "./resolvers";
import typeDefs from './typeDefs';
import { CompleteMessage, OperationResult, SubscribeMessage } from "graphql-ws";
import { IncomingMessage } from "http";

export function loadSubscriptions(
  gatewaySchema: GraphQLSchema,
  wsServer: ws.Server
) {
  const schema = makeSubscriptionSchema({ gatewaySchema, typeDefs, resolvers });
  useServer(
    {
      execute,
      subscribe,
      context: (ctx, msg: SubscribeMessage, args: ExecutionArgs) => {

        // Instantiate and initialize the GatewayDataSource subclass
        const gatewayDataSource = new GatewayDataSource(`http://localhost:${process.env.PORT}/graphql`);
        gatewayDataSource.initialize({ context: ctx, cache: undefined });

        // Return the complete context for the request
        return { dataSources: { gatewayDataSource } };
      },
      onSubscribe: (_ctx, msg: SubscribeMessage): Promise<ExecutionArgs | readonly GraphQLError[] | void> | ExecutionArgs | readonly GraphQLError[] | void => {

        // TODO:
        // const socket: ws & { customData?: any } = _ctx.extra.socket;
        // socket.customData = "customData";

        // console.log("onSubscribe", msg);

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
      onClose: (ctx, code: number, reason: string)  => {
        // TODO:
        // const socket: ws & { customData?: any } = ctx.extra.socket;
        // console.log("ctx.extra.socket.customData", socket.customData);
      },
    },
    wsServer
  );
}
