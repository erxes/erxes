import { getPlugin, getPlugins } from '../service-discovery';
import { sendCoreModuleProducer } from '../trpc/sendCoreModuleProducer';
import {
  BeforeResolversConfig,
  TBeforeResolversProducers,
} from './beforeResolvers';

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
  args: any,
  context: {
    subdomain: string;
    user?: any;
    headers?: Record<string, string | string[] | undefined>;
  },
): Promise<any> => {
  const pluginNames = await getPlugins();

  let mergedArgs = args;

  for (const pluginName of pluginNames) {
    const plugin = await getPlugin(pluginName);
    const config: BeforeResolversConfig | undefined =
      plugin?.config?.meta?.beforeResolvers;

    if (!pluginHandlesResolver(config, resolverName)) {
      continue;
    }

    const result = await sendCoreModuleProducer({
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

    if (result && typeof result === 'object') {
      mergedArgs = { ...mergedArgs, ...result };
    }
  }

  return mergedArgs;
};
