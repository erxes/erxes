import * as Redis from 'ioredis';
import * as ServiceRegistry from 'clerq';
const enabledServices = require("../enabled-services");

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, NODE_ENV } = process.env;
const isDev = NODE_ENV === 'development';

export const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD
});

const registry = new ServiceRegistry(redis, {});

const generateKey = name => `service:config:${name}`;

export const getServices = () => {
  return registry.services();
}

export const getService = async (name: string, config?: boolean) => {
  const result = {
    address: await registry.get(name),
    config: {}
  }

  if (config) {
    const value = await redis.get(`service:config:${name}`);
    result.config = JSON.parse(value || '{}');
  }

  return result;
}

export const join = ({
  name,
  port,
  dbConnectionString,
  segment,
  hasSubscriptions = false,
  importTypes,
  meta,
}: {
  name: string;
  port: string;
  dbConnectionString: string;
  segment?: any;
  hasSubscriptions?: boolean;
  importTypes?: any;
  meta?: any
}) => {
  redis.set(
    generateKey(name),

    JSON.stringify({
      dbConnectionString,
      segment,
      hasSubscriptions,
      importTypes,
      meta
    })
  );

  return registry.up(name, `http://${isDev ? 'localhost': name}:${port}`);
};

export const leave = async (name, port) => {
  await registry.down(name, `http:/${isDev ? 'localhost': name}:${port}`);

  return redis.del(generateKey(name));
};

export async function refreshEnabledServicesCache() {
  await redis.del("erxes:plugins:enabled");

  for(const serviceName in enabledServices) {
    if(!enabledServices[serviceName]) {
      continue;
    }
    await redis.sadd("erxes:plugins:enabled", serviceName);
  }

  const members = await redis.smembers("erxes:plugins:enabled");
  console.log(`Enabled plugins: ${members}`);
}