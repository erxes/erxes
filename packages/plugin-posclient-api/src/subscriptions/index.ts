import * as ws from 'ws';
import genTypeDefsAndResolvers from './genTypeDefsAndResolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { Disposable, SubscribeMessage } from 'graphql-ws';
import {
  execute,
  ExecutionArgs,
  getOperationAST,
  GraphQLError,
  parse,
  subscribe,
  validate
} from 'graphql';

let disposable: Disposable;

export async function loadSubscriptions(wsServer: ws.Server) {
  const typeDefsResolvers = await genTypeDefsAndResolvers();

  if (!typeDefsResolvers) {
    return;
  }

  const { typeDefs, resolvers } = typeDefsResolvers;

  const schema = await makeExecutableSchema({ typeDefs, resolvers });

  if (disposable) {
    try {
      await disposable.dispose();
    } catch (e) {}
  }

  disposable = useServer(
    {
      execute,
      subscribe,
      onSubscribe: async (
        _ctx,
        msg: SubscribeMessage
      ): Promise<ExecutionArgs | readonly GraphQLError[] | void> => {
        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables
        };

        const operationAST = getOperationAST(args.document, args.operationName);

        // Stops the subscription and sends an error message
        if (!operationAST) {
          return [new GraphQLError('Unable to identify operation')];
        }

        // Handle mutation and query requests
        if (operationAST.operation !== 'subscription') {
          return [
            new GraphQLError('Only subscription operations are supported')
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
