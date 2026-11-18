import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';
import type { ComponentType } from 'react';
import { parsePluginConfig } from './pluginConfig';
import type { LoadedPlugin, LoadedPluginConfig } from './types';

export interface PluginRemote {
  name: string;
  entry: string;
}

/**
 * `PUBLIC_PLUGINS`: comma-separated `<remote>@<remoteEntry url>`, e.g.
 * `hr_ui@http://localhost:3025/remoteEntry.js` — for development; deployed
 * plugins come from the registry (their manifest's `ui`).
 */
export const parsePluginRemotes = (value = import.meta.env.PUBLIC_PLUGINS ?? ''): PluginRemote[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => {
      const at = item.indexOf('@');

      if (at <= 0 || at === item.length - 1) {
        console.warn(`[plugins] ignoring "${item}": expected <remote>@<remoteEntry url>`);

        return [];
      }

      return [{ name: item.slice(0, at), entry: item.slice(at + 1) }];
    });

let registered = false;

const allowed = async (config: LoadedPluginConfig) => {
  if (!config.checkAccess) {
    return true;
  }

  try {
    return await config.checkAccess();
  } catch (error) {
    // The plugin's own API still refuses people without access; showing the
    // plugin lets it explain what is wrong instead of silently vanishing.
    console.warn(`[plugins] ${config.name}: access check failed`, error);

    return true;
  }
};

/**
 * Loads one plugin's `./config` after registering all `remotes` (once per session); null when it
 * is broken or not for this member. Each plugin loads on its own, so a slow one holds up no other.
 */
export const loadPlugin = async (
  remote: PluginRemote,
  remotes: PluginRemote[],
): Promise<LoadedPlugin | null> => {
  if (!registered) {
    registerRemotes(remotes.map(({ name, entry }) => ({ name, entry })));
    registered = true;
  }

  try {
    const module = await loadRemote<{ CONFIG?: unknown }>(`${remote.name}/config`);

    const config = parsePluginConfig(remote.name, module?.CONFIG);

    if (!config) {
      console.error(`[plugins] ${remote.name}/config does not export a valid CONFIG`);

      return null;
    }

    return (await allowed(config)) ? { remote: remote.name, config } : null;
  } catch (error) {
    console.error(`[plugins] could not load ${remote.name}`, error);

    return null;
  }
};

const pascalCase = (value: string) =>
  value.replace(/(^|[-_\s]+)(\w)/g, (_match, _separator, char: string) => char.toUpperCase());

const components = new Map<string, ComponentType>();

export const loadedPluginComponent = (remote: string, module: string) =>
  components.get(`${remote}/${module}`);

/** A plugin page module: its default export, or the PascalCase named one (`./hr` → `Hr`). */
export const loadPluginComponent = async (remote: string, module: string) => {
  const key = `${remote}/${module}`;
  const cached = components.get(key);

  if (cached) {
    return cached;
  }

  const exports = await loadRemote<Record<string, ComponentType | undefined>>(key);
  const component = exports?.default ?? exports?.[pascalCase(module)];

  if (typeof component !== 'function' && typeof component !== 'object') {
    throw new Error(`${key} has no default or ${pascalCase(module)} export`);
  }

  components.set(key, component);

  return component;
};
