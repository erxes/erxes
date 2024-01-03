import * as dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD
});

export default redis;
