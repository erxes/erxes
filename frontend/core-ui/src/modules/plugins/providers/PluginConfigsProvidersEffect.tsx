import { getInstance, loadRemote } from '@module-federation/enhanced/runtime';
import type { IUIConfig } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import {
  extensionsConfigState,
  loadingPluginsConfigState,
  pluginsConfigState,
} from 'ui-modules';
import { i18nInstance } from '~/i18n';
import {
  getPlatformMismatch,
  validatePluginConfig,
} from '~/plugins/utils/pluginConfigSchema';
import { validateExtensionConfig } from '~/plugins/utils/extensionConfigSchema';
import {
  extensionHosts,
  isExtensionRemote,
} from '~/plugins/utils/extensionRemotes';

type RemoteConfig = {
  CONFIG: unknown;
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
  const setExtensionsConfig = useSetAtom(extensionsConfigState);

  useEffect(() => {
    if (remotes && remotes.length > 0) {
      const hosts = extensionHosts(remotes);

      const loadConfig = async () => {
        for (const remote of remotes) {
          try {
            const remoteConfig = (await loadRemote(`${remote.name}/config`)) as
              | RemoteConfig
              | undefined;

            if (isExtensionRemote(remote.name)) {
              const extension = validateExtensionConfig(
                remote.name,
                remoteConfig?.CONFIG,
                hosts,
              );

              if (extension.ok) {
                setExtensionsConfig((prev) => ({
                  ...prev,
                  [extension.pluginName]: extension.config,
                }));
              } else {
                console.error(extension.message);
              }

              continue;
            }

            const validation = validatePluginConfig(
              remote.name,
              remoteConfig?.CONFIG,
            );

            if (!validation.ok) {
              console.error(validation.message);
              setLoadingPluginsConfig(false);
              continue;
            }

            const pluginConfig = validation.config;
            const mismatch = getPlatformMismatch(
              pluginConfig,
              process.env.ERXES_VERSION,
            );

            if (mismatch) {
              // Loaded anyway: a mis-declared range must not hide a working plugin.
              console.warn(`[erxes] Plugin "${remote.name}": ${mismatch}`);
            }

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
    } else {
      setLoadingPluginsConfig(false);
    }
  }, [remotes, setPluginsConfig, setExtensionsConfig]);

  return null;
};
