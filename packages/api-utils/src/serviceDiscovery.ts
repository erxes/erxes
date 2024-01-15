import * as dotenv from 'dotenv';
import redis from './redis';
dotenv.config();

const {
  NODE_ENV,
  LOAD_BALANCER_ADDRESS,
  ENABLED_SERVICES_JSON,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  SKIP_REDIS,
} = process.env;

const isDev = NODE_ENV === 'development';

if (!ENABLED_SERVICES_JSON) {
  throw new Error(
    'ENABLED_SERVICES_JSON environment variable is not configured.',
  );
}

const enabledServices = JSON.parse(ENABLED_SERVICES_JSON) || [];

if (!Array.isArray(enabledServices)) {
  throw new Error(
    "ENABLED_SERVICES_JSON environment variable's value must be JSON array",
  );
}

enabledServices.push('core');

const keyForConfig = (name) => `service:config:${name}`;

export const getServices = async (): Promise<string[]> => {
  return enabledServices;
};

type ServiceInfo = { address: string; config: any };
const serviceInfoCache: { [name in string]: Readonly<ServiceInfo> } = {};

export const getService = async (
  name: string,
): Promise<Readonly<ServiceInfo>> => {
  if (serviceInfoCache[name]) {
    return serviceInfoCache[name];
  }

  const result: ServiceInfo = {
    address: (await redis.get(`service:${name}`)) || '',
    config: { meta: {} },
  };

  const configJson = await redis.get(keyForConfig(name));
  result.config = JSON.parse(configJson || '{}');

  Object.freeze(result);
  serviceInfoCache[name] = result;

  return result;
};

export const join = async ({
  name,
  port,
  dbConnectionString,
  hasSubscriptions = false,
  importExportTypes,
  meta,
}: {
  name: string;
  port: string;
  dbConnectionString: string;
  hasSubscriptions?: boolean;
  importExportTypes?: any;
  meta?: any;
}) => {
  await redis.set(
    keyForConfig(name),

    JSON.stringify({
      dbConnectionString,
      hasSubscriptions,
      importExportTypes,
      meta,
    }),
  );

  const address =
    LOAD_BALANCER_ADDRESS ||
    `http://${isDev ? 'localhost' : `plugin-${name}-api`}:${port}`;

  await redis.set(`service:${name}`, address);

  console.log(`$service:${name} joined with ${address}`);
};

export const leave = async (name, _port) => {
  console.log(`$service:${name} left`);
};

export const isEnabled = (name) => {
  if (name === 'core') return true;
  return enabledServices.includes(name);
};

export const isAvailable = isEnabled;

const pluginAddressCache = {};

export const getPluginAddress = async (name) => {
  if (!pluginAddressCache[name]) {
    pluginAddressCache[name] = await redis.get(`service:${name}`);
  }
  return pluginAddressCache[name];
};

export const getEnabledServices = async () => {
  return enabledServices;
};
