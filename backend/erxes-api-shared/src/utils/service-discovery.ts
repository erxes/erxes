import * as dotenv from 'dotenv';
import { redis } from './redis';
import {
  getGlobalProfileV2Plugins,
  getSaasOrganizationDetail,
  isGlobalProfileV2,
} from './saas';
import { getEnv } from './utils';
import { IOrganizationCharge } from '../core-types';
import { sendWorkerQueue } from './mq-worker';
import { clearCachedPermissionMaps } from './permission-cache';

dotenv.config();

const { NODE_ENV, LOAD_BALANCER_ADDRESS, MONGO_URL } = process.env;
const GATEWAY_ROUTER_UPDATE_LOCK_KEY = 'gateway:update-apollo-router:pending';

interface PluginConfig {
  name: string;
  port: number;
  hasSubscriptions?: boolean;
  hasGraphql?: boolean;
  meta?: any;
}

export const isDev = NODE_ENV === 'development';

export const keyForConfig = (name: string) => `erxesservice:config:${name}`;

export const getPlugins = async (): Promise<string[]> => {
  const enabledServices: any[] =
    process.env.ENABLED_PLUGINS?.split(',').map((plugin) => `${plugin}`) || [];

  const enabledApiPlugins: any[] =
    process.env.ENABLED_PLUGINS_ONLY_API?.split(',').map(
      (plugin) => `${plugin}`,
    ) || [];

  return ['core', ...enabledServices, ...enabledApiPlugins];
};

const pluginList = (value?: string) =>
  (value || '')
    .split(',')
    .map((plugin) => plugin.trim())
    .filter(Boolean);

/**
 * Plugins (also listed in ENABLED_PLUGINS or ENABLED_PLUGINS_ONLY_API) that
 * serve no GraphQL; they are reached only through `/pl:<name>`.
 */
export const getNoGraphqlPlugins = (): string[] =>
  pluginList(process.env.ENABLED_PLUGINS_NO_GRAPHQL).filter(
    (plugin) => plugin !== 'core',
  );

/** The plugins the gateway composes into the supergraph. */
export const getGraphqlPlugins = async (): Promise<string[]> => {
  const noGraphql = new Set(getNoGraphqlPlugins());

  return (await getPlugins()).filter((plugin) => !noGraphql.has(plugin));
};

const ACTIVE_PLUGINS_KEY = 'erxes-active-plugins';

export const setActivePlugins = async (plugins: string[]): Promise<void> => {
  await redis.set(ACTIVE_PLUGINS_KEY, JSON.stringify(plugins));
};

export const getActivePlugins = async (): Promise<string[]> => {
  const data = await redis.get(ACTIVE_PLUGINS_KEY);

  if (!data) {
    return ['core'];
  }

  return JSON.parse(data);
};

export const getAvailablePlugins = async (
  subdomain: string,
): Promise<string[]> => {
  const ENABLED_PLUGINS = getEnv({ name: 'ENABLED_PLUGINS' });
  const ENABLED_API_PLUGINS = getEnv({ name: 'ENABLED_PLUGINS_ONLY_API' });

  const VERSION = getEnv({ name: 'VERSION', defaultValue: 'os' });

  if (VERSION && VERSION === 'saas') {
    const organizationInfo = await getSaasOrganizationDetail({
      subdomain,
    });

    if (isGlobalProfileV2(organizationInfo)) {
      const enabled = [
        ...ENABLED_PLUGINS.split(','),
        ...ENABLED_API_PLUGINS.split(','),
      ];
      const plugins = await getGlobalProfileV2Plugins(organizationInfo);

      return ['core', ...plugins.filter((plugin) => enabled.includes(plugin))];
    }

    const charges = organizationInfo.charge as IOrganizationCharge;

    const plugins: string[] = [];

    Object.keys(charges).forEach((key) => {
      if (
        (charges[key].purchased && charges[key].purchased > 0) ||
        (charges[key].free && charges[key].free > 0)
      ) {
        const pluginName = key.split(':')[0];

        const enabledPluginsArray = ENABLED_PLUGINS.split(',');
        enabledPluginsArray.push(...ENABLED_API_PLUGINS.split(','));

        if (enabledPluginsArray.includes(pluginName)) {
          plugins.push(pluginName);
        }
      }
    });
    return ['core', ...plugins];
  } else {
    return getPlugins();
  }
};

type ServiceInfo = { address: string; config: any };
const serviceInfoCache: { [name in string]: Readonly<ServiceInfo> } = {};
const pluginAddressCache = {} as any;

export const clearServiceDiscoveryCache = (name?: string) => {
  if (name) {
    delete serviceInfoCache[name];
    delete pluginAddressCache[name];
    return;
  }

  Object.keys(serviceInfoCache).forEach((key) => delete serviceInfoCache[key]);
  Object.keys(pluginAddressCache).forEach(
    (key) => delete pluginAddressCache[key],
  );
};

export const getPlugin = async (
  name: string,
): Promise<Readonly<ServiceInfo>> => {
  if (serviceInfoCache[name]) {
    return serviceInfoCache[name];
  }

  const result: ServiceInfo = {
    address: (await redis.get(`erxes-service-${name}`)) || '',
    config: { meta: {} },
  };

  const configJson = await redis.get(keyForConfig(name));
  result.config = JSON.parse(configJson || '{}');

  Object.freeze(result);
  // Registration writes config and address separately. A lookup during startup
  // must not pin a missing/partial service for the lifetime of this process.
  if (result.address && Object.keys(result.config || {}).length > 0) {
    serviceInfoCache[name] = result;
  }

  return result;
};

export const joinErxesGateway = async ({
  name,
  port,
  hasSubscriptions = false,
  hasGraphql = true,
  meta,
}: PluginConfig) => {
  const rawVersion = process.env.RELEASE_VERSION;
  const releaseVersion = rawVersion?.startsWith('3.') ? rawVersion : 'latest';
  // Lets a plugin serve its own UI remote (a local dev server or its own
  // versioned CDN path) instead of the plugins.erxes.io release folder.
  const uiEntry = process.env.UI_ENTRY_URL || undefined;

  const existingConfigJson = await redis.get(keyForConfig(name));
  const existingConfig = existingConfigJson
    ? JSON.parse(existingConfigJson)
    : {};

  const permissionsChanged =
    meta?.permissions !== undefined &&
    JSON.stringify(meta.permissions) !==
      JSON.stringify(existingConfig?.meta?.permissions);

  await redis.set(
    keyForConfig(name),

    JSON.stringify({
      dbConnectionString: MONGO_URL,
      hasSubscriptions,
      hasGraphql,
      meta: {
        ...existingConfig?.meta,
        ...meta,
      },
      releaseVersion,
      uiEntry,
    }),
  );

  // Cached permission maps were built from the old definitions (an upgrade
  // that adds actions to a default group would otherwise keep refusing them
  // until each user's groups change); they rebuild on the next request.
  // Runs in the background so a large shared Redis never holds up startup.
  if (permissionsChanged) {
    clearCachedPermissionMaps().catch((error) =>
      console.error(
        `Could not clear cached permission maps: ${error?.message || error}`,
      ),
    );
  }

  const address =
    LOAD_BALANCER_ADDRESS ||
    `http://${isDev ? 'localhost' : `plugin-${name}-api`}:${port}`;

  await redis.set(`erxes-service-${name}`, address);

  // Without GraphQL there is nothing for the gateway to recompose.
  if (NODE_ENV === 'production' && hasGraphql) {
    try {
      const didAcquireUpdateLock = await redis.set(
        GATEWAY_ROUTER_UPDATE_LOCK_KEY,
        '1',
        'EX',
        30,
        'NX',
      );

      if (!didAcquireUpdateLock) {
        console.log(
          `gateway update-apollo-router already queued, skipped ${name}`,
        );
        console.log(`erxes-service${name} joined with ${address}`);
        return;
      }

      await sendWorkerQueue('gateway', 'update-apollo-router').add(
        'service-discovery-updated',
        { pluginName: name },
        {
          delay: 10_000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: 100,
        },
      );
    } catch (e) {
      console.error(e);
    }
  }

  console.log(`erxes-service${name} joined with ${address}`);
};

export const leaveErxesGateway = async (name: string, port: number) => {
  console.log(`erxes-service${name} left ${port}`);
};

export const isEnabled = async (name: string) => {
  if (name === 'core') return true;

  const enabledServices = await getPlugins();

  return enabledServices.includes(name);
};

export const getPluginAddress = async (name: string) => {
  if (!pluginAddressCache[name]) {
    pluginAddressCache[name] = await redis.get(`erxes-service-${name}`);
  }
  return pluginAddressCache[name];
};

function getNonFunctionProps<T extends object>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (typeof obj[key] !== 'function') {
      result[key] = obj[key];
    }
  }

  return result;
}

export const initializePluginConfig = async <TConfig extends object>(
  pluginName: string,
  propertyName: string,
  config: TConfig,
) => {
  const pluginConfig = await redis.get(keyForConfig(pluginName));
  const configJSON = JSON.parse(pluginConfig || '{}');

  await redis.set(
    keyForConfig(pluginName),

    JSON.stringify({
      ...configJSON,
      meta: {
        ...configJSON?.meta,
        [propertyName]: getNonFunctionProps<TConfig>(config),
      },
    }),
  );
};
