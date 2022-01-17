import * as Redis from "ioredis";
import * as ServiceRegistry from 'clerq';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || "6379", 10),
  password: REDIS_PASSWORD,
});

const registry = new ServiceRegistry(redis, {});

export const join = (name, port) => registry.up(name, `http://localhost:${port}`);
export const leave = (name, port) => registry.down(name, `http://localhost:${port}`);