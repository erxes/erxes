import type {
  IPublicApiConfig,
  IPublicApiOperation,
} from '../core-types';
import { getActivePlugins, getPlugin } from './service-discovery';

export const getPublicApiOperations = async (): Promise<
  IPublicApiOperation[]
> => {
  const pluginNames = await getActivePlugins();
  const operations: IPublicApiOperation[] = [];

  for (const pluginName of pluginNames) {
    const plugin = await getPlugin(pluginName);
    const config = plugin.config?.meta?.publicApi as
      | IPublicApiConfig
      | undefined;

    if (config?.operations?.length) {
      operations.push(...config.operations);
    }
  }

  return operations;
};
