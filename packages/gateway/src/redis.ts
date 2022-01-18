import * as dotenv from "dotenv";
import Redis from "ioredis";
import ServiceRegistry from 'clerq';

dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || "6379", 10),
  password: REDIS_PASSWORD,
});

const registry = new ServiceRegistry(redis, {});

export const getServices = () => {
  return registry.services();
}

export const getService = async (name: string, meta?: boolean) => {
  const result = {
    address: await registry.get(name),
    meta: {}
  }

  if (meta) {
    const value = await redis.get(`service:config:${name}`);
    result.meta = JSON.parse(value || '{}');
  }

  return result;
}

export default redis;