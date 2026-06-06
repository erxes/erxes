import * as Sentry from '@sentry/node';
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
import { classifyError } from '../errorClassifier';

const withSentryCapture = (
  resolver: Resolver,
  resolverKey: string,
  operation: 'query' | 'mutation',
): Resolver => {
  return async (root, args, context, info) => {
    try {
      return await resolver(root, args, context, info);
    } catch (err) {
      const classification = classifyError(err);

      // Only capture system/provider errors in Sentry
      // Expected business errors (not found, validation, etc.) are skipped
      if (classification.category !== 'EXPECTED') {
        Sentry.withScope((scope) => {
          scope.setTag('graphql.operation', operation);
          scope.setTag('graphql.field', resolverKey);
          scope.setTag('error.category', classification.category);
          scope.setContext('graphql', {
            field: resolverKey,
            operation,
            subdomain: context?.subdomain,
            userId: context?.user?._id,
            errorCategory: classification.category,
          });
          Sentry.captureException(err);
        });
      }

      throw err;
    }
  };
};

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

        let wrapped: Resolver;
        if (isPublic) {
          wrapped = wrapPublicResolver(
            withBeforeResolvers(mutationResolver, mutationKey),
            mutationResolver.wrapperConfig,
          );
        } else {
          wrapped = withLogging(
            wrapPermission(
              withBeforeResolvers(mutationResolver, mutationKey),
              mutationKey,
            ),
          );
        }

        mutationResolvers[mutationKey] = withSentryCapture(
          wrapped,
          mutationKey,
          'mutation',
        );
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

        let wrapped: Resolver;
        if (isPublic) {
          wrapped = wrapPublicResolver(
            withBeforeResolvers(queryResolver, queryKey),
            queryResolver.wrapperConfig,
          );
        } else {
          wrapped = wrapPermission(
            withBeforeResolvers(queryResolver, queryKey),
            queryKey,
          );
        }

        queryResolvers[queryKey] = withSentryCapture(
          wrapped,
          queryKey,
          'query',
        );
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
