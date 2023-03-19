import * as Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as fakeRedis from './redisSubstitute';
dotenv.config();

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_DB,
  SKIP_REDIS
} = process.env;

const redis = SKIP_REDIS
  ? fakeRedis
  : new Redis({
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT || '6379', 10),
      password: REDIS_PASSWORD,
      db: parseInt(REDIS_DB || '0', 10)
    });

export default redis;
