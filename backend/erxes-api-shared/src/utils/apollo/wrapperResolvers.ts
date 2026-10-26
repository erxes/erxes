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

    const result = await runBeforeResolvers(resolverKey, args, {
      subdomain,
      user,
      headers,
    });

    if (result.resolved) {
      return result.data;
    }

    return resolver(root, result.args, context, info);
  };
};

type TLogRedaction = {
  sensitiveArgs?: boolean;
  sensitiveResult?: true | string[];
};

const withoutFields = (value: unknown, fields: string[]): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => withoutFields(entry, fields));
  }

  const plain =
    value && typeof (value as { toObject?: unknown }).toObject === 'function'
      ? (value as { toObject: () => unknown }).toObject()
      : value;

  if (!plain || typeof plain !== 'object') {
    return plain;
  }

  const copy: Record<string, unknown> = { ...(plain as Record<string, unknown>) };

  fields.forEach((field) => delete copy[field]);

  return copy;
};

// `sensitiveArgs` mutations are logged without their arguments and
// `sensitiveResult` ones without their result or its listed fields; the
// caller still receives the full result.
const withLogging = (
  resolver: Resolver,
  { sensitiveArgs, sensitiveResult }: TLogRedaction = {},
): Resolver => {
  return async (root, args, context, info) => {
    const { user, req, processId, subdomain } = context;
    const requestData = req.headers;
    // Merged into the stored payload once the resolver has returned.
    const onSuccess: Record<string, unknown> = {};

    return await logHandler(
      async () => {
        const result = await resolver(root, args, context, info);

        if (sensitiveResult) {
          onSuccess.resultRedacted = true;

          if (sensitiveResult !== true) {
            onSuccess.result = withoutFields(result, sensitiveResult);
          }
        }

        return result;
      },
      {
        subdomain,
        source: 'graphql',
        action: 'mutation',
        payload: {
          mutationName: info.fieldName,
          requestData,
          ...(sensitiveArgs ? { argsRedacted: true } : { args }),
        },
        processId,
        userId: user?._id,
      },
      onSuccess,
      undefined,
      Boolean(sensitiveResult),
    );
  };
};

export const wrapApolloResolvers = (resolvers: Record<string, Resolver>) => {
  const wrappedResolvers: any = {};

  for (const [key, resolver] of Object.entries(resolvers)) {
    if (key === 'Mutation') {
      const mutationResolvers: any = {};

      for (const [mutationKey, mutationResolver] of Object.entries(resolver)) {
        const {
          skipPermission,
          cpUserRequired,
          forClientPortal,
          sensitiveArgs,
          sensitiveResult,
        } = mutationResolver.wrapperConfig || {};
        const isPublic = skipPermission || forClientPortal || cpUserRequired;
        // Secret-bearing arguments are never forwarded to plugin hooks.
        const inner = sensitiveArgs
          ? mutationResolver
          : withBeforeResolvers(mutationResolver, mutationKey);

        let wrapped: Resolver;
        if (isPublic) {
          wrapped = wrapPublicResolver(inner, mutationResolver.wrapperConfig);
        } else {
          wrapped = withLogging(wrapPermission(inner, mutationKey), {
            sensitiveArgs,
            sensitiveResult,
          });
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
        const {
          skipPermission,
          cpUserRequired,
          forClientPortal,
          sensitiveArgs,
        } = queryResolver.wrapperConfig || {};
        const isPublic = skipPermission || forClientPortal || cpUserRequired;
        const inner = sensitiveArgs
          ? queryResolver
          : withBeforeResolvers(queryResolver, queryKey);

        let wrapped: Resolver;
        if (isPublic) {
          wrapped = wrapPublicResolver(inner, queryResolver.wrapperConfig);
        } else {
          wrapped = wrapPermission(inner, queryKey);
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
