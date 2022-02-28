import * as Redis from 'ioredis';
import * as ServiceRegistry from 'clerq';
import * as dotenv from 'dotenv';
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, NODE_ENV } = process.env;
const isDev = NODE_ENV === 'development';

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD
});

const registry = new ServiceRegistry(redis, {});

const generateKey = name => `service:config:${name}`;

export const getServices = () => {
  return registry.services();
};

export const getService = async (name: string, config?: boolean) => {
  const result = {
    address: await registry.get(name),
    config: {}
  };

  if (config) {
    const value = await redis.get(`service:config:${name}`);
    result.config = JSON.parse(value || '{}');
  }

  return result;
};

export const join = ({
  name,
  port,
  dbConnectionString,
  segment,
  hasSubscriptions = false,
  importTypes,
  exportTypes,
  meta
}: {
  name: string;
  port: string;
  dbConnectionString: string;
  segment?: any;
  hasSubscriptions?: boolean;
  importTypes?: any;
  exportTypes?: any;
  meta?: any;
}) => {
  redis.set(
    generateKey(name),

    JSON.stringify({
      dbConnectionString,
      segment,
      hasSubscriptions,
      importTypes,
      exportTypes,
      meta
    })
  );

  return registry.up(
    name,
    `http://${isDev ? 'localhost' : `plugin-${name}-api`}:${port}`
  );
};

export const leave = async (name, port) => {
  await registry.down(
    name,
    `http://${isDev ? 'localhost' : `plugin-${name}-api`}:${port}`
  );

  return redis.del(generateKey(name));
};
