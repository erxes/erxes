import * as dotenv from 'dotenv';
import redisClient from './redis';

dotenv.config();

const REDIS_ENABLED_SERVICES_KEY = 'enabled_services_set';

const { NODE_ENV, LOAD_BALANCER_ADDRESS, ENABLED_SERVICES_PATH } = process.env;

const isDev = NODE_ENV === 'development';

if (!ENABLED_SERVICES_PATH) {
  throw new Error(
    'ENABLED_SERVICES_PATH environment variable is not configured.'
  );
}

async function ensureCache() {
  const serviceCount = await redisClient.scard(REDIS_ENABLED_SERVICES_KEY);
  if (serviceCount > 0) return;

  if (!ENABLED_SERVICES_PATH) {
    throw new Error(
      'ENABLED_SERVICES_PATH environment variable is not configured.'
    );
  }
  delete require.cache[require.resolve(ENABLED_SERVICES_PATH)];
  const enabledServices: string[] = require(ENABLED_SERVICES_PATH);
  // @ts-ignore
  await redisClient.sadd(REDIS_ENABLED_SERVICES_KEY, [
    'core',
    ...enabledServices
  ]);
}

export const redis = redisClient;

const generateKey = name => `service:config:${name}`;

export const getServices = async (): Promise<string[]> => {
  await ensureCache();
  const enabledPlugins = await redisClient.smembers(REDIS_ENABLED_SERVICES_KEY);
  return enabledPlugins;
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

export const isEnabled = async name => {
  if (name === 'core') return true;
  await ensureCache();
  return !!(await redisClient.sismember(REDIS_ENABLED_SERVICES_KEY, name));
};

export const isAvailable = isEnabled;

export const clearCache = async () => {
  console.log('Clearing enabled services cache ........');
  await redis.del(REDIS_ENABLED_SERVICES_KEY);
};
