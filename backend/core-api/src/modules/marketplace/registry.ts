import {
  getEnv,
  keyForConfig,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { IPluginInstall } from './db/models/PluginInstalls';

const REGISTRY_CACHE_KEY_PREFIX = 'erxes:plugin-registry';
const REGISTRY_CACHE_TTL_SECONDS = 300;

export const INSTALLED_PLUGINS_KEY = 'erxes-installed-plugins';
const GATEWAY_ROUTER_UPDATE_LOCK_KEY = 'gateway:update-apollo-router:pending';

export interface IRegistryPluginApi {
  image?: string;
  address?: string;
  port?: number;
  health?: string;
  env?: string[];
  hasSubscriptions?: boolean;
}

export interface IRegistryPluginUi {
  remote: string;
  entry: string;
  exposes?: string[];
}

export interface IRegistryPlugin {
  name: string;
  version?: string;
  description?: string;
  icon?: string;
  source?: 'catalog' | 'github';
  repoUrl?: string;
  api?: IRegistryPluginApi;
  ui?: IRegistryPluginUi;
}

interface IRegistryFile {
  version: number;
  plugins: IRegistryPlugin[];
}

const DEFAULT_REGISTRY_URL =
  'https://raw.githubusercontent.com/erxes/erxes/main/plugin-registry/plugins.json';

const NAME_RE = /^[a-z][a-z0-9-]*$/;
const UI_REMOTE_RE = /^[a-z][a-z0-9_]*$/;

const fetchJson = async (url: string): Promise<unknown> => {
  const res = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'erxes-marketplace' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (HTTP ${res.status})`);
  }

  return res.json();
};

export const validatePluginManifest = (
  manifest: Partial<IRegistryPlugin>,
): IRegistryPlugin => {
  if (!manifest.name || !NAME_RE.test(manifest.name)) {
    throw new Error(
      `Invalid plugin name "${manifest.name ?? ''}": must match ${NAME_RE}`,
    );
  }

  if (!manifest.api && !manifest.ui) {
    throw new Error('Plugin manifest must declare an api or a ui');
  }

  if (manifest.ui) {
    if (!manifest.ui.remote || !manifest.ui.entry) {
      throw new Error('Plugin ui manifest must declare remote and entry');
    }

    if (!UI_REMOTE_RE.test(manifest.ui.remote)) {
      throw new Error(
        `Invalid ui.remote "${manifest.ui.remote}": must match ${UI_REMOTE_RE}`,
      );
    }

    const isHttps = (value: string): boolean => {
      try {
        const { protocol } = new URL(value);
        return (
          protocol === 'https:' ||
          (protocol === 'http:' && process.env.NODE_ENV !== 'production')
        );
      } catch {
        return false;
      }
    };

    if (!isHttps(manifest.ui.entry)) {
      throw new Error(
        `Invalid ui.entry "${manifest.ui.entry}": must be an https URL`,
      );
    }
  }

  if (manifest.api && !manifest.api.address && !manifest.api.image) {
    throw new Error('Plugin api manifest must declare address or image');
  }

  return manifest as IRegistryPlugin;
};

export const fetchRegistryCatalog = async (): Promise<IRegistryPlugin[]> => {
  const url = process.env.PLUGIN_REGISTRY_URL || DEFAULT_REGISTRY_URL;

  const cacheKey = `${REGISTRY_CACHE_KEY_PREFIX}:${url}`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached) as IRegistryPlugin[];
  }

  const data = (await fetchJson(url)) as IRegistryFile;

  const entries = Array.isArray(data.plugins) ? data.plugins : [];
  const plugins: IRegistryPlugin[] = [];

  for (const entry of entries) {
    try {
      plugins.push(validatePluginManifest(entry));
    } catch (e) {
      console.warn(`Skipping invalid registry entry: ${(e as Error).message}`);
    }
  }

  await redis.set(
    cacheKey,
    JSON.stringify(plugins),
    'EX',
    REGISTRY_CACHE_TTL_SECONDS,
  );

  return plugins;
};

const GITHUB_RE =
  /^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:\/tree\/([^/]+))?\/?$/;

export const fetchPluginManifest = async (
  repoUrl: string,
): Promise<IRegistryPlugin> => {
  const match = GITHUB_RE.exec(repoUrl.trim());

  if (!match) {
    throw new Error(
      `Unsupported repo URL "${repoUrl}": expected https://github.com/<owner>/<repo>`,
    );
  }

  const [, owner, repo, ref] = match;

  const base = `https://raw.githubusercontent.com/${owner}/${repo}`;
  const refs = ref ? [ref] : ['main', 'master'];

  let lastError: Error | null = null;

  for (const branch of refs) {
    try {
      const manifest = (await fetchJson(
        `${base}/${branch}/plugin.json`,
      )) as Partial<IRegistryPlugin>;

      return validatePluginManifest(manifest);
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError || new Error('plugin.json not found in repository');
};

const isSaas = () => getEnv({ name: 'VERSION', defaultValue: 'os' }) === 'saas';

export const isGithubInstallEnabled = (): boolean =>
  process.env.MARKETPLACE_ALLOW_GITHUB_INSTALL === 'true' && !isSaas();

export const assertInstallableName = (name: string): void => {
  const provided = new Set(['core', 'gateway']);

  for (const envName of ['ENABLED_PLUGINS', 'ENABLED_PLUGINS_ONLY_API']) {
    for (const entry of (process.env[envName] || '').split(',')) {
      const trimmed = entry.trim();

      if (trimmed) {
        provided.add(trimmed);
      }
    }
  }

  if (provided.has(name)) {
    throw new Error(
      `Plugin "${name}" is already provided by this deployment and cannot be installed from the marketplace`,
    );
  }
};

const queueRouterUpdate = async (name: string): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    const didAcquireUpdateLock = await redis.set(
      GATEWAY_ROUTER_UPDATE_LOCK_KEY,
      '1',
      'EX',
      30,
      'NX',
    );

    if (!didAcquireUpdateLock) {
      return;
    }

    await sendWorkerQueue('gateway', 'update-apollo-router').add(
      'service-discovery-updated',
      { pluginName: name },
      {
        delay: 10_000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  } catch (e) {
    console.error(e);
  }
};

/**
 * Registers a plugin's api with gateway service discovery and adds it to the
 * installed-plugin set that the gateway composes the supergraph from.
 *
 * No-op on SaaS: org installs are per-tenant, while the supergraph and plugin
 * services are shared platform resources. No-op for ui-only plugins.
 */
export const registerPluginService = async (
  plugin: Pick<IRegistryPlugin, 'name' | 'api'>,
): Promise<void> => {
  if (!plugin.api || isSaas()) {
    return;
  }

  const manifestAddress = plugin.api.address;
  // A plugin deployed via its image self-registers with service discovery
  // (joinErxesGateway); the manifest can also point at a running address.
  const address =
    manifestAddress ||
    (await redis.get(`erxes-service-${plugin.name}`)) ||
    undefined;

  if (!address) {
    throw new Error(
      `Plugin "${plugin.name}" API is not running: deploy it (it self-registers with service discovery) or set api.address in plugin.json`,
    );
  }

  const isHttpUrl = (value: string): boolean => {
    try {
      const { protocol } = new URL(value);
      return protocol === 'http:' || protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (!isHttpUrl(address)) {
    throw new Error(
      `Plugin "${plugin.name}" API address "${address}" must be an http(s) URL`,
    );
  }

  // The gateway waits forever on any installed plugin with no working
  // endpoint, so fail the install unless the subgraph answers.
  try {
    const res = await fetch(`${address}/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: 'query SubgraphIntrospectQuery { _service { sdl } }',
        operationName: 'SubgraphIntrospectQuery',
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch {
    throw new Error(
      `Plugin "${plugin.name}" API at ${address} is not reachable`,
    );
  }

  // Only manifest-declared addresses write discovery keys — a self-registered
  // plugin owns its own `erxes-service-*`/config keys.
  if (manifestAddress) {
    const rawVersion = process.env.RELEASE_VERSION;
    const releaseVersion = rawVersion?.startsWith('3.') ? rawVersion : 'latest';

    const existingConfigJson = await redis.get(keyForConfig(plugin.name));
    const existingConfig = existingConfigJson
      ? JSON.parse(existingConfigJson)
      : {};

    await redis.set(
      keyForConfig(plugin.name),
      JSON.stringify({
        dbConnectionString: process.env.MONGO_URL || '',
        hasSubscriptions: plugin.api.hasSubscriptions ?? false,
        meta: { ...existingConfig?.meta },
        releaseVersion,
      }),
    );

    await redis.set(`erxes-service-${plugin.name}`, manifestAddress);
  }

  await redis.sadd(INSTALLED_PLUGINS_KEY, plugin.name);
  await queueRouterUpdate(plugin.name);
};

export const unregisterPluginService = async (name: string): Promise<void> => {
  if (isSaas()) {
    return;
  }

  // Never delete `erxes-service-*` or config keys — a running plugin owns
  // them; removing from the installed set is enough to drop it from the
  // supergraph.
  await redis.srem(INSTALLED_PLUGINS_KEY, name);
  await queueRouterUpdate(name);
};

export const registryEntryToInstall = (
  plugin: IRegistryPlugin,
  source: 'catalog' | 'github',
  repoUrl?: string,
): IPluginInstall => ({
  name: plugin.name,
  version: plugin.version || 'latest',
  description: plugin.description,
  icon: plugin.icon,
  source,
  repoUrl,
  api: plugin.api,
  ui: plugin.ui,
  enabled: true,
});
