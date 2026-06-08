import { getInstance, loadRemote } from '@module-federation/enhanced/runtime';
import { IUIConfig } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { loadingPluginsConfigState, pluginsConfigState } from 'ui-modules';
import { i18nInstance } from '~/i18n';

type RemoteConfig = {
  CONFIG: IUIConfig;
};

export const PluginConfigsProvidersEffect = () => {
  const instance = getInstance();
  const remotes = instance?.options.remotes;
  const setPluginsConfig = useSetAtom(pluginsConfigState);
  const setLoadingPluginsConfig = useSetAtom(loadingPluginsConfigState);

  useEffect(() => {
    if (remotes && remotes.length > 0) {
      const loadConfig = async () => {
        for (const remote of remotes) {
          try {
            const remoteConfig = (await loadRemote(
              `${remote.name}/config`,
            )) as RemoteConfig;
            const pluginConfig = remoteConfig.CONFIG;

            if (pluginConfig.i18n) {
              i18nInstance.loadNamespaces(pluginConfig.name);
            }

            setPluginsConfig((prev) => ({
              ...prev,
              [remote.name]: pluginConfig,
            }));
            setTimeout(() => {
              setLoadingPluginsConfig(false);
            });
          } catch (error) {
            console.error(`Failed to load config from ${remote.name}:`, error);
            setLoadingPluginsConfig(false);
          }
        }
      };

      loadConfig();
    }
  }, [remotes, setPluginsConfig]);

  return null;
};
