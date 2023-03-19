import * as dotenv from 'dotenv';
import * as Redis from 'ioredis';

dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD,
  db: parseInt(REDIS_DB || '0', 10)
});

export default redis;
