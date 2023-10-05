import * as dotenv from 'dotenv';
import redisClient from './redis';
import Redis from 'ioredis';
dotenv.config();

const REDIS_CHANNEL_REFRESH_ENABLED_SERVICES = 'refresh_enabled_services';

const {
  NODE_ENV,
  LOAD_BALANCER_ADDRESS,
  ENABLED_SERVICES_PATH,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  SKIP_REDIS
} = process.env;
let enabledServicesCache: string[] = [];

const isDev = NODE_ENV === 'development';

if (!ENABLED_SERVICES_PATH) {
  throw new Error(
    'ENABLED_SERVICES_PATH environment variable is not configured.'
  );
}

function refreshEnabledServices() {
  if (!ENABLED_SERVICES_PATH) {
    throw new Error(
      'ENABLED_SERVICES_PATH environment variable is not configured.'
    );
  }

  delete require.cache[require.resolve(ENABLED_SERVICES_PATH)];
  enabledServicesCache = require(ENABLED_SERVICES_PATH) || [];
  enabledServicesCache.push('core');
}

function ensureCache() {
  if (!enabledServicesCache || enabledServicesCache.length === 0) {
    refreshEnabledServices();
  }
}

export const redis = redisClient;

const generateKey = name => `service:config:${name}`;

export const getServices = async (): Promise<string[]> => {
  ensureCache();
  return [...enabledServicesCache];
};

export const getService = async (name: string, config?: boolean) => {
  const result: { address: string; config: any } = {
    address: (await redis.get(`service:${name}`)) || '',
    config: { meta: {} }
  };

  if (config) {
    const value = await redis.get(generateKey(name));
    result.config = JSON.parse(value || '{}');
  }

  return result;
};

export const join = async ({
  name,
  port,
  dbConnectionString,
  hasSubscriptions = false,
  hasDashboard = false,
  importExportTypes,
  meta
}: {
  name: string;
  port: string;
  dbConnectionString: string;
  hasSubscriptions?: boolean;
  hasDashboard?: boolean;
  importExportTypes?: any;
  meta?: any;
}) => {
  await redis.set(
    generateKey(name),

    JSON.stringify({
      dbConnectionString,
      hasSubscriptions,
      hasDashboard,
      importExportTypes,
      meta
    })
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

export const isEnabled = name => {
  if (name === 'core') return true;
  ensureCache();
  return enabledServicesCache.includes(name);
};

export const isAvailable = isEnabled;

const pluginAddressCache = {};

export const getPluginAddress = async name => {
  if (!pluginAddressCache[name]) {
    pluginAddressCache[name] = await redis.get(`service:${name}`);
  }
  return pluginAddressCache[name];
};

export const getEnabledServices = async () => {
  ensureCache();
  return [...enabledServicesCache];
};

export const publishRefreshEnabledServices = async () => {
  await redis.publish(REDIS_CHANNEL_REFRESH_ENABLED_SERVICES, '');
};

(async () => {
  if (SKIP_REDIS) return;

  const redisSubscriber = new Redis({
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT || '6379', 10),
    password: REDIS_PASSWORD
  });
  await redisSubscriber.subscribe(REDIS_CHANNEL_REFRESH_ENABLED_SERVICES);
  await redisSubscriber.on('message', refreshEnabledServices);
})();
