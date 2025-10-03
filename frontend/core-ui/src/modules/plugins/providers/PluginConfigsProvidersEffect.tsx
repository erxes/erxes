import { getInstance } from '@module-federation/enhanced/runtime';
import { useEffect } from 'react';
import { pluginsConfigState } from 'ui-modules';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { useSetAtom } from 'jotai';
import { IUIConfig } from 'erxes-ui';

type RemoteConfig = {
  CONFIG: IUIConfig;
};

export const PluginConfigsProvidersEffect = () => {
  const instance = getInstance();
  const remotes = instance?.options.remotes;
  const setPluginsConfig = useSetAtom(pluginsConfigState);

  useEffect(() => {
    if (remotes && remotes.length > 0) {
      const loadConfig = async () => {
        for (const remote of remotes) {
          try {
            const remoteConfig = (await loadRemote(
              `${remote.name}/config`,
            )) as RemoteConfig;
            const pluginConfig = remoteConfig.CONFIG;

            setPluginsConfig((prev) => ({
              ...prev,
              [remote.name]: pluginConfig,
            }));
          } catch (error) {
            console.error(`Failed to load config from ${remote.name}:`, error);
          }
        }
      };

      loadConfig();
    }
  }, [remotes, setPluginsConfig]);

  return null;
};
