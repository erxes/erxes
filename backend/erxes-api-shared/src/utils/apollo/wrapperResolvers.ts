import {
  wrapPermission,
  wrapPublicResolver,
} from '../../core-modules/permissions/utils';
import {
  IMainContext,
  IResolverSymbol,
  Resolver,
} from '../../core-types/common';
import { logHandler } from '../logs';
import { runBeforeResolvers } from './runBeforeResolvers';

const withBeforeResolvers = (
  resolver: Resolver,
  resolverKey: string,
): Resolver => {
  return async (root, args, context, info) => {
    const { subdomain, user } = context;

    const headers = (context as any).requestInfo?.headers || (context as any).req?.headers;

    const nextArgs = await runBeforeResolvers(resolverKey, args, {
      subdomain,
      user,
      headers,
    });
    return resolver(root, nextArgs, context, info);
  };
};

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
        const { skipPermission, cpUserRequired, forClientPortal } =
          mutationResolver.wrapperConfig || {};
        const isPublic = skipPermission || forClientPortal || cpUserRequired;

        if (isPublic) {
          mutationResolvers[mutationKey] = wrapPublicResolver(
            withBeforeResolvers(mutationResolver, mutationKey),
            mutationResolver.wrapperConfig,
          );
        } else {
          mutationResolvers[mutationKey] = withLogging(
            wrapPermission(
              withBeforeResolvers(mutationResolver, mutationKey),
              mutationKey,
            ),
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
          queryResolver.wrapperConfig || {};
        const isPublic = skipPermission || forClientPortal || cpUserRequired;

        if (isPublic) {
          queryResolvers[queryKey] = wrapPublicResolver(
            withBeforeResolvers(queryResolver, queryKey),
            queryResolver.wrapperConfig,
          );
        } else {
          queryResolvers[queryKey] = wrapPermission(
            withBeforeResolvers(queryResolver, queryKey),
            queryKey,
          );
        }
      }

      wrappedResolvers[key] = queryResolvers;
      continue;
    }

    wrappedResolvers[key] = resolver;
  }

  return wrappedResolvers;
};
type TResolverMap<TContext = any> = Record<
  string,
  Resolver<any, any, TContext & { subdomain: string } & IMainContext, any>
>;

export const markResolvers = <TContext = any>(
  resolvers: TResolverMap<TContext>,
  symbols: IResolverSymbol,
) => {
  for (const key in resolvers) {
    resolvers[key] = Object.assign(resolvers[key], symbols);
  }
};
