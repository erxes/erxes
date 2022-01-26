import * as Redis from 'ioredis';
import * as ServiceRegistry from 'clerq';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD
});

const registry = new ServiceRegistry(redis, {});

const generateKey = name => `service:config:${name}`;

export const join = ({
  name,
  port,
  dbConnectionString,
  segment,
  hasSubscriptions = false,
  importTypes
}: {
  name: string;
  port: string;
  dbConnectionString: string;
  segment?: any;
  hasSubscriptions?: boolean;
  importTypes?: any;
}) => {
  redis.set(
    generateKey(name),
    JSON.stringify({
      dbConnectionString,
      segment,
      hasSubscriptions,
      importTypes
    })
  );

  return registry.up(name, `http://localhost:${port}`);
};

export const leave = (name, port) => {
  registry.down(name, `http://localhost:${port}`);

  redis.del(generateKey(name));
};
