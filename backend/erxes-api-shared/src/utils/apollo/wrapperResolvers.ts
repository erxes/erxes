import {
  checkSaasLimit,
  wrapPermission,
  wrapPublicResolver,
} from '../../core-modules/permissions/utils';
import { IResolverSymbol, Resolver } from '../../core-types/common';
import { logHandler } from '../logs';
import { getEnv } from '../utils';

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

const wrapSaasLimit = (
  resolver: Resolver,
  wrapperConfig?: IResolverSymbol['wrapperConfig'],
): Resolver => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (!VERSION || VERSION !== 'saas') {
    return resolver;
  }

  return async (root, args, context, info) => {
    const { subdomain } = context;
    const saasLimit = wrapperConfig?.saasLimit;

    if (saasLimit) {
      const { checks, generateDelta } = saasLimit;
      await checkSaasLimit(
        subdomain,
        checks,
        generateDelta && generateDelta(args),
      );
    }

    return resolver(root, args, context, info);
  };
};

export const wrapApolloResolvers = (resolvers: Record<string, Resolver>) => {
  const wrappedResolvers: any = {};

  for (const [key, resolver] of Object.entries(resolvers)) {
    if (key === 'Mutation') {
      const mutationResolvers: any = {};

      for (const [mutationKey, mutationResolver] of Object.entries(resolver)) {
        const { skipPermission, cpUserRequired, forClientPortal, saasLimit } =
          (mutationResolver.wrapperConfig as IResolverSymbol['wrapperConfig']) ||
          {};
        const isPublic = skipPermission || forClientPortal || cpUserRequired;

        if (isPublic) {
          mutationResolvers[mutationKey] = wrapSaasLimit(
            wrapPublicResolver(
              mutationResolver,
              mutationResolver.wrapperConfig,
            ),
          );
        } else {
          mutationResolvers[mutationKey] = wrapSaasLimit(
            withLogging(wrapPermission(mutationResolver, mutationKey)),
          );
        }
      }

      wrappedResolvers[key] = mutationResolvers;
      continue;
    }

    if (key === 'Query') {
      const queryResolvers: any = {};

      for (const [queryKey, queryResolver] of Object.entries(resolver)) {
        const { skipPermission, cpUserRequired, forClientPortal } =
          (queryResolver.wrapperConfig as IResolverSymbol['wrapperConfig']) ||
          {};
        const isPublic = skipPermission || forClientPortal || cpUserRequired;

        if (isPublic) {
          queryResolvers[queryKey] = wrapPublicResolver(
            queryResolver,
            queryResolver.wrapperConfig,
          );
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
