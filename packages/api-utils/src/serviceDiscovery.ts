import * as Redis from "ioredis";
import * as dotenv from "dotenv";

dotenv.config();

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  NODE_ENV,
  LOAD_BALANCER_ADDRESS,
  ENABLED_SERVICES_PATH
} = process.env;

const isDev = NODE_ENV === "development";

if (!ENABLED_SERVICES_PATH) {
  throw new Error("ENABLED_SERVICES_PATH environment variable is not configured.")
}

const readEnabledServices = async () => {
  const cacheValue = await redis.lrange('enabled-services', 0, -1);

  if (cacheValue && cacheValue.length > 0) {
    return cacheValue;
  }

  delete require.cache[require.resolve(ENABLED_SERVICES_PATH)];
  const enabledServices = require(ENABLED_SERVICES_PATH);

  await redis.del('enabled-services');
  await redis.rpush('enabled-services', ...enabledServices);

  return enabledServices;
}

export const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || "6379", 10),
  password: REDIS_PASSWORD,
});

const generateKey = (name) => `service:config:${name}`;

export const getServices = async (): Promise<string[]> => {
  const enabledPlugins = await readEnabledServices();
  return ["core", ...enabledPlugins];
}

export const getService = async (name: string, config?: boolean) => {
  const result: { address: string; config: any } = {
    address: await redis.get(`service:${name}`) || '',
    config: { meta: {} },
  };

  if (config) {
    const value = await redis.get(generateKey(name));
    result.config = JSON.parse(value || "{}");
  }

  return result;
};

export const join = async ({
  name,
  port,
  dbConnectionString,
  hasSubscriptions = false,
  importTypes,
  exportTypes,
  meta,
}: {
  name: string;
  port: string;
  dbConnectionString: string;
  hasSubscriptions?: boolean;
  importTypes?: any;
  exportTypes?: any;
  meta?: any;
}) => {
  await redis.set(
    generateKey(name),

    JSON.stringify({
      dbConnectionString,
      hasSubscriptions,
      importTypes,
      exportTypes,
      meta,
    })
  );

  await redis.set(
    `service:${name}`,
    LOAD_BALANCER_ADDRESS || `http://${isDev ? "localhost" : `plugin-${name}-api`}:${port}`
  )
};

export const leave = async (name, _port) => {
  await redis.del(`service:${name}`);

  try {
    await redis.del(`service:queuenames:${name}`);
  } catch (e) {
    console.log(`error during service:queuenames delete ${e.message}`);
  }

  return redis.del(generateKey(name));
};

export const isAvailable = async (name) => {
  const serviceNames = await readEnabledServices();
  return (name === "core") || serviceNames.includes(name);
};

export const isEnabled = async (name) => {
  const serviceNames = await readEnabledServices();
  return (name === "core") || serviceNames.includes(name);
};