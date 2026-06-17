import { getPlugin, getPlugins } from '../service-discovery';
import { sendCoreModuleProducer } from '../trpc/sendCoreModuleProducer';
import { createExpectedError } from '../errorClassifier';
import {
  BeforeResolverBlockedResult,
  BeforeResolversConfig,
  BeforeResolverOkResult,
  TBeforeResolversProducers,
} from './beforeResolvers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isBlockedResult = (
  result: unknown,
): result is BeforeResolverBlockedResult =>
  isRecord(result) &&
  result.status === 'blocked' &&
  typeof result.code === 'string' &&
  typeof result.message === 'string';

const isOkResult = (result: unknown): result is BeforeResolverOkResult =>
  isRecord(result) && result.status === 'ok';

const mergeBeforeResolverArgs = (
  args: Record<string, unknown>,
  result: unknown,
): Record<string, unknown> => {
  if (isOkResult(result)) {
    return isRecord(result.args) ? { ...args, ...result.args } : args;
  }

  if (isRecord(result)) {
    return { ...args, ...result };
  }

  return args;
};

export type BeforeResolverCheckBlockedResult = BeforeResolverBlockedResult & {
  pluginName: string;
};

export type BeforeResolverCheckResult = {
  available: boolean;
  args: Record<string, unknown>;
  blocked: BeforeResolverCheckBlockedResult[];
};

const pluginHandlesResolver = (
  config: BeforeResolversConfig | undefined,
  resolverName: string,
): boolean => {
  if (!config?.resolvers) {
    return false;
  }

  for (const moduleName of Object.keys(config.resolvers)) {
    if ((config.resolvers[moduleName] || []).includes(resolverName)) {
      return true;
    }
  }

  return false;
};

export const runBeforeResolvers = async (
  resolverName: string,
  args: Record<string, unknown>,
  context: {
    subdomain: string;
    user?: unknown;
    headers?: Record<string, string | string[] | undefined>;
  },
): Promise<Record<string, unknown>> => {
  const pluginNames = await getPlugins();

  let mergedArgs = args;

  for (const pluginName of pluginNames) {
    const plugin = await getPlugin(pluginName);
    const config: BeforeResolversConfig | undefined =
      plugin?.config?.meta?.beforeResolvers;

    if (!pluginHandlesResolver(config, resolverName)) {
      continue;
    }

    const result: unknown = await sendCoreModuleProducer({
      subdomain: context.subdomain,
      pluginName,
      moduleName: 'beforeResolvers',
      producerName: TBeforeResolversProducers.HANDLE,
      input: {
        resolver: resolverName,
        args: mergedArgs,
        user: context.user,
        headers: context.headers,
      },
    });

    if (isBlockedResult(result)) {
      throw createExpectedError(result.message, result.code);
    }

    mergedArgs = mergeBeforeResolverArgs(mergedArgs, result);
  }

  return mergedArgs;
};

export const checkBeforeResolvers = async (
  resolverName: string,
  args: Record<string, unknown>,
  context: {
    subdomain: string;
    user?: unknown;
    headers?: Record<string, string | string[] | undefined>;
  },
): Promise<BeforeResolverCheckResult> => {
  const pluginNames = await getPlugins();

  let mergedArgs = args;
  const blocked: BeforeResolverCheckBlockedResult[] = [];

  for (const pluginName of pluginNames) {
    const plugin = await getPlugin(pluginName);
    const config: BeforeResolversConfig | undefined =
      plugin?.config?.meta?.beforeResolvers;

    if (!pluginHandlesResolver(config, resolverName)) {
      continue;
    }

    const result: unknown = await sendCoreModuleProducer({
      subdomain: context.subdomain,
      pluginName,
      moduleName: 'beforeResolvers',
      producerName: TBeforeResolversProducers.CHECK,
      method: 'query',
      input: {
        resolver: resolverName,
        args: mergedArgs,
        user: context.user,
        headers: context.headers,
      },
    });

    if (isBlockedResult(result)) {
      blocked.push({ ...result, pluginName });
      continue;
    }

    mergedArgs = mergeBeforeResolverArgs(mergedArgs, result);
  }

  return {
    available: blocked.length === 0,
    args: mergedArgs,
    blocked,
  };
};
