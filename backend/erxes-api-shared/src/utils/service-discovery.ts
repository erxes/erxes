import * as dotenv from 'dotenv';
import { redis } from './redis';
import { getSaasOrganizationDetail } from './saas';
import { getEnv } from './utils';
import { IOrganizationCharge } from '../core-types';

dotenv.config();

const { NODE_ENV, LOAD_BALANCER_ADDRESS, MONGO_URL } = process.env;

interface PluginConfig {
  name: string;
  port: number;
  hasSubscriptions?: boolean;
  meta?: any;
}

export const isDev = NODE_ENV === 'development';

export const keyForConfig = (name: string) => `erxesservice:config:${name}`;

export const getPlugins = async (): Promise<string[]> => {
  const enabledServices: any[] =
    process.env.ENABLED_PLUGINS?.split(',').map((plugin) => `${plugin}`) || [];

  return ['core', ...enabledServices];
};

export const getAvailablePlugins = async (
  subdomain: string,
): Promise<string[]> => {
  const ENABLED_PLUGINS = getEnv({ name: 'ENABLED_PLUGINS' });
  const VERSION = getEnv({ name: 'VERSION', defaultValue: 'os' });

  if (VERSION && VERSION === 'saas') {
    const organizationInfo = await getSaasOrganizationDetail({
      subdomain,
    });

    const charges = organizationInfo.charge as IOrganizationCharge;

    const plugins: string[] = [];

    Object.keys(charges).forEach((key) => {
      if (
        (charges[key].purchased && charges[key].purchased > 0) ||
        (charges[key].free && charges[key].free > 0)
      ) {
        const pluginName = key.split(':')[0];

        const enabledPluginsArray = ENABLED_PLUGINS.split(',');
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
  serviceInfoCache[name] = result;

  return result;
};

export const joinErxesGateway = async ({
  name,
  port,
  hasSubscriptions = false,
  meta,
}: PluginConfig) => {
  await redis.set(
    keyForConfig(name),

    JSON.stringify({
      dbConnectionString: MONGO_URL,
      hasSubscriptions,
      meta,
    }),
  );

  const address =
    LOAD_BALANCER_ADDRESS ||
    `http://${isDev ? 'localhost' : `plugin-${name}-api`}:${port}`;

  await redis.set(`erxes-service-${name}`, address);

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

const pluginAddressCache = {} as any;

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
        ...(configJSON?.meta || {}),
        [propertyName]: getNonFunctionProps<TConfig>(config),
      },
    }),
  );
};
