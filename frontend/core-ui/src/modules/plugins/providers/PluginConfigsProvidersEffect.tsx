import { getInstance, loadRemote } from '@module-federation/enhanced/runtime';
import type { IUIConfig } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { loadingPluginsConfigState, pluginsConfigState } from 'ui-modules';
import { i18nInstance } from '~/i18n';

type RemoteConfig = {
  CONFIG: IUIConfig;
};

export const loadPluginI18nNamespace = async ({
  i18n,
  i18nNamespace,
  name,
}: Pick<IUIConfig, 'i18n' | 'i18nNamespace' | 'name'>) => {
  const namespace = i18nNamespace ?? (i18n ? name : undefined);

  if (!namespace) {
    return;
  }

  try {
    await i18nInstance.loadNamespaces(namespace);
  } catch (error) {
    console.error(
      `Failed to load translation namespace "${namespace}" for ${name}:`,
      error,
    );
  }
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

            await loadPluginI18nNamespace(pluginConfig);

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
