import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';
import type { ComponentType } from 'react';
import type { LoadedPlugin, PluginConfig } from './types';

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

const isConfig = (value: unknown): value is PluginConfig =>
  typeof value === 'object' &&
  value !== null &&
  'name' in value &&
  typeof value.name === 'string' &&
  'path' in value &&
  typeof value.path === 'string' &&
  !!value.path;

const allowed = async (config: PluginConfig) => {
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

/** Registers the remotes and loads every plugin's `./config`; broken ones are skipped. */
export const loadPlugins = async (remotes = parsePluginRemotes()): Promise<LoadedPlugin[]> => {
  if (!remotes.length) {
    return [];
  }

  if (!registered) {
    registerRemotes(remotes.map((remote) => ({ name: remote.name, entry: remote.entry })));
    registered = true;
  }

  const results = await Promise.all(
    remotes.map(async (remote): Promise<LoadedPlugin | null> => {
      try {
        const module = await loadRemote<{ CONFIG?: unknown }>(`${remote.name}/config`);

        if (!isConfig(module?.CONFIG)) {
          console.error(`[plugins] ${remote.name}/config does not export a valid CONFIG`);

          return null;
        }

        return (await allowed(module.CONFIG))
          ? { remote: remote.name, config: module.CONFIG }
          : null;
      } catch (error) {
        console.error(`[plugins] could not load ${remote.name}`, error);

        return null;
      }
    }),
  );

  return results.filter((plugin): plugin is LoadedPlugin => plugin !== null);
};

const pascalCase = (value: string) =>
  value.replace(/(^|[-_\s]+)(\w)/g, (_match, _separator, char: string) => char.toUpperCase());

const components = new Map<string, ComponentType>();

/** React renders functions, classes and memo / forwardRef objects. */
const isComponent = (value: unknown): value is ComponentType =>
  typeof value === 'function' || (typeof value === 'object' && value !== null);

export const loadedPluginComponent = (remote: string, module: string) =>
  components.get(`${remote}/${module}`);

/** A plugin page module: its default export, or the PascalCase named one (`./hr` → `Hr`). */
export const loadPluginComponent = async (remote: string, module: string) => {
  const key = `${remote}/${module}`;
  const cached = components.get(key);

  if (cached) {
    return cached;
  }

  const exports = await loadRemote<Record<string, unknown>>(key);

  const component = exports?.default ?? exports?.[pascalCase(module)];

  if (!isComponent(component)) {
    throw new Error(`${key} has no default or ${pascalCase(module)} export`);
  }

  components.set(key, component);

  return component;
};
