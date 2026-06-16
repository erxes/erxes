import { ILogContentTypeConfig } from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';

/**
 * Resolved revert config for one entity's contentType, keyed `plugin:module.collection`.
 */
export interface ResolvedContentTypeConfig {
  contentType: string;
  pluginName: string;
  moduleName: string;
  collectionName: string;
  permission?: string;
  mongooseName?: string;
}

/**
 * Build a map of contentType -> revert config across all active plugins, reading
 * each plugin's meta.logs.contentTypes (the same source logsGetContentTypes uses).
 * Used by the revert orchestrator to look up the gating permission and the
 * mongoose model name for every entity touched by a process.
 */
export const buildContentTypeConfigMap = async (): Promise<
  Map<string, ResolvedContentTypeConfig>
> => {
  const map = new Map<string, ResolvedContentTypeConfig>();
  const pluginNames = await getPlugins();

  await Promise.all(
    pluginNames.map(async (pluginName) => {
      try {
        const plugin = await getPlugin(pluginName);
        const meta = plugin.config?.meta || {};
        const serviceContentTypes = (meta.logs?.contentTypes ||
          []) as ILogContentTypeConfig[];

        for (const ct of serviceContentTypes) {
          if (!ct.moduleName || !ct.collectionName) {
            continue;
          }
          const contentType = `${pluginName}:${ct.moduleName}.${ct.collectionName}`;
          map.set(contentType, {
            contentType,
            pluginName,
            moduleName: ct.moduleName,
            collectionName: ct.collectionName,
            permission: ct.permission,
            mongooseName: ct.mongooseName,
          });
        }
      } catch (error) {
        console.error(
          `Failed to load logs config from plugin ${pluginName}:`,
          error,
        );
      }
    }),
  );

  return map;
};
