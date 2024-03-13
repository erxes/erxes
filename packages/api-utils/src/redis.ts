import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import MockRedis from 'ioredis-mock';
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, SKIP_REDIS } = process.env;

const redis = SKIP_REDIS
  ? new MockRedis()
  : new Redis({
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT || '6379', 10),
      password: REDIS_PASSWORD,
      connectTimeout: 20_000,
      reconnectOnError: (error) => {
        const targetErrors = [/READONLY/, /ETIMEDOUT/];
        if (
          targetErrors.some((targetError) => targetError.test(error.message))
        ) {
          return 2;
        } else {
          return false;
        }
      },
    });

export default redis;
