import * as dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: ''
});

export default redis;
