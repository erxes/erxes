import {
  getInstance,
  loadRemote,
  registerRemotes,
} from '@module-federation/enhanced/runtime';
import { REACT_APP_API_URL } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { extensionsConfigState } from 'ui-modules';
import { validateExtensionConfig } from '~/plugins/utils/extensionConfigSchema';
import {
  extensionHosts,
  type FrontendRemote,
  toFederationRemotes,
} from '~/plugins/utils/extensionRemotes';

/**
 * Loads the installed extensions' UIs again, the way boot does, so an
 * install, enable, disable, version switch or uninstall shows without a page
 * reload. New and moved remotes are registered; every extension config is
 * replaced, which drops the ones no longer installed.
 */
export const useReloadExtensions = () => {
  const setExtensionsConfig = useSetAtom(extensionsConfigState);

  return useCallback(async () => {
    const response = await fetch(`${REACT_APP_API_URL}/get-frontend-plugins`);

    if (!response.ok) {
      throw new Error(`Could not list extensions (${response.status})`);
    }

    const listed: FrontendRemote[] = await response.json();
    const remotes = toFederationRemotes(
      listed.filter(({ kind }) => kind === 'extension'),
    );

    // A version switch keeps the remote's name and moves its entry.
    const registered = getInstance()?.options.remotes ?? [];
    const changed = remotes.filter(
      ({ name, entry }) =>
        !registered.some(
          (remote) =>
            remote.name === name && 'entry' in remote && remote.entry === entry,
        ),
    );

    if (changed.length > 0) {
      // force drops the old entry's loaded modules, so ./config and the
      // components it imports load from the new one.
      registerRemotes(changed, { force: true });
    }

    const hosts = extensionHosts(getInstance()?.options.remotes ?? []);
    const configs = await Promise.all(
      remotes.map(async ({ name }) => {
        const remoteConfig = await loadRemote<{ CONFIG: unknown }>(
          `${name}/config`,
        ).catch(() => null);
        const extension = validateExtensionConfig(
          name,
          remoteConfig?.CONFIG,
          hosts,
        );

        if (!extension.ok) {
          console.error(extension.message);
          return [];
        }

        return [[extension.pluginName, extension.config] as const];
      }),
    );

    setExtensionsConfig(Object.fromEntries(configs.flat()));
  }, [setExtensionsConfig]);
};
