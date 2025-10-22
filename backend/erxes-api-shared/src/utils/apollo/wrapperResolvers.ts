import { wrapPermission } from '../../core-modules/permissions/utils';
import { IResolverSymbol, Resolver } from '../../core-types/common';
import { logHandler } from '../logs';

const withLogging = (resolver: Resolver): Resolver => {
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

export const wrapApolloResolvers = (resolvers: Record<string, Resolver>) => {
  const wrappedResolvers: any = {};

  for (const [key, resolver] of Object.entries(resolvers)) {
    if (key === 'Mutation') {
      const mutationResolvers: any = {};

      for (const [mutationKey, mutationResolver] of Object.entries(resolver)) {
        const isPublic = mutationResolver.skipPermission === true;

        if (isPublic) {
          mutationResolvers[mutationKey] = mutationResolver;
        } else {
          mutationResolvers[mutationKey] = withLogging(
            wrapPermission(mutationResolver, mutationKey),
          );
        }
      }

      wrappedResolvers[key] = mutationResolvers;
      continue;
    }

    if (key === 'Query') {
      const queryResolvers: any = {};

      for (const [queryKey, queryResolver] of Object.entries(resolver)) {
        const isPublic = queryResolver.skipPermission === true;

        if (isPublic) {
          queryResolvers[queryKey] = queryResolver;
        } else {
          queryResolvers[queryKey] = wrapPermission(queryResolver, queryKey);
        }
      }

      wrappedResolvers[key] = queryResolvers;
      continue;
    }

    wrappedResolvers[key] = resolver;
  }

  return wrappedResolvers;
};

export const markResolvers = (
  resolvers: Record<string, Resolver>,
  symbols: IResolverSymbol,
) => {
  for (const key in resolvers) {
    resolvers[key] = Object.assign(resolvers[key], symbols);
  }
};