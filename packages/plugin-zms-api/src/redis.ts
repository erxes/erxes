import * as dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

//const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: ''
});

export default redis;
