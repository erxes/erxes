/**
 * The plugins `vp run dev:stack up <plugin dir>...` runs beside core: each one's name, ports and
 * secret, its database role, the environment its API and UI dev servers start with, and its
 * install in the e2e organisation. A plugin made by `pnpm create erxes` works as it is: its root
 * package is `@<name>/plugin`, `pnpm dev:api` and `pnpm dev:ui` start it, the API answers
 * `/health` and reads its settings from the environment, the UI takes `UI_PORT`.
 */
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

/** A dev server the stack starts with `pnpm <args>` in `cwd`; it is up once `ready` answers. */
export type DevServer = { cwd: string; args: string[]; env: Record<string, string>; ready: string };

export type DevPlugin = {
  name: string;
  dir: string;
  apiPort: number;
  uiPort: number;
  secret: string;
};

export const DevPlugins = z.array(
  z.object({
    name: z.string(),
    dir: z.string(),
    apiPort: z.number(),
    uiPort: z.number(),
    secret: z.string(),
  }),
);

const PluginPackage = z.object({ name: z.string().regex(/^@[a-z][a-z0-9_]*\/plugin$/) });

/**
 * Reads the plugin checkouts. Ports come after the checkout's own block, two per plugin, so
 * parallel core checkouts and the plugins' own defaults never collide.
 */
export const readPlugins = (dirs: string[], firstPort: number): DevPlugin[] =>
  dirs.map((given, index) => {
    const dir = resolve(given);
    const manifest = resolve(dir, 'package.json');

    if (!existsSync(manifest)) throw new Error(`${dir} has no package.json: not a plugin checkout`);

    const parsed = PluginPackage.safeParse(JSON.parse(readFileSync(manifest, 'utf8')));

    if (!parsed.success) throw new Error(`${manifest}: the name is not "@<plugin>/plugin"`);

    return {
      name: parsed.data.name.slice(1, -'/plugin'.length),
      dir,
      apiPort: firstPort + index * 2,
      uiPort: firstPort + index * 2 + 1,
      secret: randomBytes(24).toString('base64url'),
    };
  });

const apiUrl = (plugin: DevPlugin) => `http://localhost:${plugin.apiPort}`;
const uiEntry = (plugin: DevPlugin) => `http://localhost:${plugin.uiPort}/remoteEntry.js`;

/** What core's API and web need to know the plugins: their secrets and UI remotes. */
export const coreEnv = (plugins: DevPlugin[]): Record<string, string> =>
  plugins.length
    ? {
        CORE_PLUGIN_KEYS: plugins.map((plugin) => `${plugin.name}:${plugin.secret}`).join(','),
        PUBLIC_PLUGINS: plugins.map((plugin) => `${plugin.name}_ui@${uiEntry(plugin)}`).join(','),
      }
    : {};

/** The passwords `pnpm db:plugin-role` printed, by plugin name. */
export const rolePasswords = (printed: string) =>
  new Map(
    [
      ...printed.matchAll(
        /Role erxes_plugin_(\w+) is ready\. Its password \(shown once\):\s+(\S+)/g,
      ),
    ].map(([, name = '', password = '']) => [name, password]),
  );

/** The plugin's API and UI dev servers, as the stack starts them. */
export const pluginServers = (
  plugin: DevPlugin,
  core: { dataUrl: (role: string, password: string) => string; api: string; ui: string },
  password: string,
): Record<string, DevServer> => {
  const role = `erxes_plugin_${plugin.name}`;

  return {
    [`${plugin.name}-api`]: {
      cwd: plugin.dir,
      args: ['dev:api'],
      env: {
        PORT: String(plugin.apiPort),
        DATA_URL: core.dataUrl(role, password),
        CORE_URL: core.api,
        CORE_UI_URL: core.ui,
        PLUGIN_SECRET: plugin.secret,
        PUBLIC_URL: apiUrl(plugin),
        UI_ENTRY_URL: uiEntry(plugin),
      },
      ready: `${apiUrl(plugin)}/health`,
    },
    [`${plugin.name}-ui`]: {
      cwd: plugin.dir,
      args: ['dev:ui'],
      env: { UI_PORT: String(plugin.uiPort) },
      ready: uiEntry(plugin),
    },
  };
};

/**
 * Installs each plugin in the e2e organisation and grants the scopes and reads its manifest asks
 * for, as the owner would in Settings › Plugins. A plugin registers its manifest once its API is
 * up, so a refusal is retried for a while.
 */
export const installPlugins = async (
  plugins: DevPlugin[],
  core: string,
  token: string,
  wait: (ms: number) => Promise<unknown>,
) => {
  for (const plugin of plugins) {
    const url = `${core}/core/v1/plugins/${plugin.name}/install`;
    let last = '';

    for (let attempt = 0; attempt < 60; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: '{}',
      });

      if (response.ok) break;

      last = `${response.status} ${await response.text()}`;

      if (attempt === 59) throw new Error(`installing ${plugin.name}: ${last}`);

      await wait(1000);
    }
  }
};
