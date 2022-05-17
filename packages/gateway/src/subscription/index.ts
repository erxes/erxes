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
import * as ws from "ws";
import { GraphQLSchema } from "graphql";
import GatewayDataSource from "./GatewayDataSource";
import {
  Disposable,
  SubscribeMessage,
} from "graphql-ws";
import genTypeDefsAndResolvers from './genTypeDefsAndResolvers';

let disposable: Disposable;

export async function loadSubscriptions(
  gatewaySchema: GraphQLSchema,
  wsServer: ws.Server
) {

  const typeDefsResolvers = await genTypeDefsAndResolvers();

  if(!typeDefsResolvers) { return; }

  const { typeDefs, resolvers } = typeDefsResolvers;

  const schema = makeSubscriptionSchema({ gatewaySchema, typeDefs, resolvers });

  if(disposable) {
    try {
      await disposable.dispose();
    } catch (e) {
      
    }
  }

  disposable = useServer(
    {
      execute,
      subscribe,
      context: (ctx, _msg: SubscribeMessage, _args: ExecutionArgs) => {
        // Instantiate and initialize the GatewayDataSource subclass
        const gatewayDataSource = new GatewayDataSource(
          `http://localhost:${process.env.PORT}/graphql`
        );
        gatewayDataSource.initialize({ context: ctx, cache: undefined });

        // Return the complete context for the request
        return { dataSources: { gatewayDataSource } };
      },
      onSubscribe: async (
        _ctx,
        msg: SubscribeMessage
      ): Promise<ExecutionArgs | readonly GraphQLError[] | void> => {
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
      }
    },
    wsServer
  );
}


