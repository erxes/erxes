import * as dotenv from 'dotenv';
import * as redis from 'redis';

// load environment variables
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const NODE_ENV = process.env.NODE_ENV || 'development';

let client;

export const initRedis = (callback?: (client) => void) => {
  client = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    connect_timeout: 15000,
    enable_offline_queue: true,
    retry_unfulfilled_commands: true,
    retry_strategy: options => {
      // reconnect after
      return Math.max(options.attempt * 100, 3000);
    }
  });

  if (callback) {
    callback(client);
  }
};

/*
 * Get item
 */
export const get = (key: string, defaultValue?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (NODE_ENV === 'test') {
      return resolve(defaultValue || '');
    }

    client.get(key, (error, reply) => {
      if (error) {
        return reject(error);
      }

      return resolve(reply && reply !== 'nil' ? reply : defaultValue);
    });
  });
};

/*
 * Set item
 */
export const set = (key: string, value: any) => {
  if (NODE_ENV === 'test') {
    return;
  }

  client.set(key, value);
};

/*
 * Get array
 */
export const getArray = async (key: string): Promise<any> => {
  const value = await get(key, '[]');

  return JSON.parse(value);
};

/*
 * Set array
 */
export const setArray = (key: string, value: any[]) => {
  client.set(key, JSON.stringify(value));
};

/**
 * Health check status
 * retryStrategy - get response immediately
 */
export const redisStatus = () => {
  return new Promise((resolve, reject) => {
    client.ping((error, result) => {
      if (error) {
        return reject(error);
      }

      return resolve(result);
    });
  });
};
