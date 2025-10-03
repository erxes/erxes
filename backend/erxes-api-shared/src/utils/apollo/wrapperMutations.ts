import { IMainContext } from '../../core-types';
import { GraphQLResolveInfo } from 'graphql';
import { logHandler } from '../logs';

type GraphqlLogHandler<TArgs = any, TReturn = any> = (
  root: any,
  args: TArgs,
  context: { subdomain: string } & IMainContext,
  info: GraphQLResolveInfo,
) => Promise<TReturn> | TReturn;

const withLogging = (resolver: GraphqlLogHandler): GraphqlLogHandler => {
  return async (root, args, context, info) => {
    const { user, req, processId, subdomain } = context;
    const requestData = req.headers;

    return await logHandler(
      async () => await resolver(root, args, context, info),
      {
        subdomain,
        source: 'graphql',
        action: 'mutation',
        payload: {
          mutationName: info.fieldName,
          requestData,
          args,
        },
        processId,
        userId: user?._id,
      },
    );
  };
};

// Apply middleware to all mutations in an object
export const wrapApolloMutations = (
  mutations: Record<string, GraphqlLogHandler>,
  muataionsForSkip?: string[],
) => {
  const wrappedMutations: Record<string, GraphqlLogHandler> = {};

  for (const [key, resolver] of Object.entries(mutations)) {
    if (muataionsForSkip?.includes(key)) {
      wrappedMutations[key] = resolver;
    } else {
      wrappedMutations[key] = withLogging(resolver);
    }
  }

  return wrappedMutations;
};
