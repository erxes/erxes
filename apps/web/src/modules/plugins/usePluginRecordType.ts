import { pluginBasePath } from './pluginConfig';
import { usePlugins } from './usePlugins';

/**
 * The plugin record type of `contentType` (`sales:deal`), from the installed plugins the member
 * may use, with the plugin's name (for its crash message) and where its pages mount.
 * `loading` while the plugins load.
 */
export const usePluginRecordType = (contentType: string) => {
  const { plugins, loading } = usePlugins();

  return { entry: findPluginRecordType(plugins, contentType), loading };
};

/** The record type of `contentType` among `plugins`, as `usePluginRecordType` reads it. */
export const findPluginRecordType = (
  plugins: ReturnType<typeof usePlugins>['plugins'],
  contentType: string,
) => {
  for (const { config } of plugins) {
    const type = config.recordTypes.find((entry) => entry.contentType === contentType);

    if (type) return { plugin: config.name, base: pluginBasePath(config.path), type };
  }

  return undefined;
};
