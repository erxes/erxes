import Redis from 'ioredis';
import Redlock from 'redlock';
import * as dotenv from 'dotenv';
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

let redlock: Redlock;

if (REDIS_HOST) {
  const redis = new Redis({
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT || '6379', 10),
    password: REDIS_PASSWORD,
  });

  redlock = new Redlock([redis], {
    retryCount: 3,
    retryDelay: 100,
    driftFactor: 0.01,
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
} else {
  console.warn(
    'Redis not configured, IMAP will run without distributed locking',
  );
  redlock = {
    acquire: async () => {
      throw new Error('Redis not configured');
    },
    lock: async () => {
      throw new Error('Redis not configured');
    },
    unlock: async () => {
      return Promise.resolve();
    },
  } as any;
}

export { redlock };