import {
  getEnv,
  keyForConfig,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { IPluginInstall } from './db/models/PluginInstalls';

const REGISTRY_CACHE_KEY = 'erxes:plugin-registry';
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
  'https://raw.githubusercontent.com/Amartuvshins0404/erxes-plugin/main/registry/plugins.json';

const NAME_RE = /^[a-z][a-z0-9-]*$/;

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

  if (manifest.ui && (!manifest.ui.remote || !manifest.ui.entry)) {
    throw new Error('Plugin ui manifest must declare remote and entry');
  }

  if (manifest.api && !manifest.api.address && !manifest.api.image) {
    throw new Error('Plugin api manifest must declare address or image');
  }

  return manifest as IRegistryPlugin;
};

export const fetchRegistryCatalog = async (): Promise<IRegistryPlugin[]> => {
  const url = process.env.PLUGIN_REGISTRY_URL || DEFAULT_REGISTRY_URL;

  const cached = await redis.get(REGISTRY_CACHE_KEY);

  if (cached) {
    return JSON.parse(cached) as IRegistryPlugin[];
  }

  const data = (await fetchJson(url)) as IRegistryFile;

  const plugins = Array.isArray(data.plugins) ? data.plugins : [];

  await redis.set(
    REGISTRY_CACHE_KEY,
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

const addToInstalledSet = async (name: string): Promise<void> => {
  const data = await redis.get(INSTALLED_PLUGINS_KEY);
  const plugins: string[] = data ? JSON.parse(data) : [];

  if (!plugins.includes(name)) {
    plugins.push(name);
    await redis.set(INSTALLED_PLUGINS_KEY, JSON.stringify(plugins));
  }
};

const removeFromInstalledSet = async (name: string): Promise<void> => {
  const data = await redis.get(INSTALLED_PLUGINS_KEY);
  const plugins: string[] = data ? JSON.parse(data) : [];

  if (plugins.includes(name)) {
    await redis.set(
      INSTALLED_PLUGINS_KEY,
      JSON.stringify(plugins.filter((p) => p !== name)),
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
  const address = plugin.api?.address;

  if (!address || isSaas()) {
    return;
  }

  const rawVersion = process.env.RELEASE_VERSION;
  const releaseVersion = rawVersion?.startsWith('3.') ? rawVersion : 'latest';

  const existingConfigJson = await redis.get(keyForConfig(plugin.name));
  const existingConfig = existingConfigJson ? JSON.parse(existingConfigJson) : {};

  await redis.set(
    keyForConfig(plugin.name),
    JSON.stringify({
      dbConnectionString: process.env.MONGO_URL || '',
      hasSubscriptions: plugin.api?.hasSubscriptions ?? false,
      meta: { ...existingConfig?.meta },
      releaseVersion,
    }),
  );

  await redis.set(`erxes-service-${plugin.name}`, address);
  await addToInstalledSet(plugin.name);
  await queueRouterUpdate(plugin.name);
};

export const unregisterPluginService = async (
  name: string,
): Promise<void> => {
  if (isSaas()) {
    return;
  }

  await redis.del(`erxes-service-${name}`, keyForConfig(name));
  await removeFromInstalledSet(name);
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
