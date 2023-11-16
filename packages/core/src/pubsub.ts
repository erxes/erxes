import * as dotenv from 'dotenv';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

// load environment variables
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redisOptions = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD
};

const createPubsubInstance = () => {
  return new RedisPubSub({
    connectionListener: error => {
      if (error) {
        console.error(error);
      }
    },
    publisher: new Redis(redisOptions),
    subscriber: new Redis(redisOptions)
  });
};

export const graphqlPubsub = createPubsubInstance();
