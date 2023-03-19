import * as dotenv from 'dotenv';
dotenv.config();
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = process.env;

const pubsub = new RedisPubSub({
  connectionListener: error => {
    if (error) {
      console.log(error);
    }
  },
  publisher: new Redis({
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT || '6379'),
    password: REDIS_PASSWORD,
    db: parseInt(REDIS_DB || '0', 10)
  }),
  subscriber: new Redis({
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT || '6379'),
    password: REDIS_PASSWORD,
    db: parseInt(REDIS_DB || '0', 10)
  })
} as any);

export default pubsub;
