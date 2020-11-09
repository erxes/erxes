import * as dotenv from 'dotenv';
import { redisOptions } from 'erxes-inmemory-storage';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PubSub } from 'graphql-subscriptions';
import * as Redis from 'ioredis';

// load environment variables
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const createPubsubInstance = () => {
  if (REDIS_HOST) {
    redisOptions.host = REDIS_HOST;
    redisOptions.port = REDIS_PORT;
    redisOptions.password = REDIS_PASSWORD;

    return new RedisPubSub({
      connectionListener: error => {
        if (error) {
          console.error(error);
        }
      },
      publisher: new Redis(redisOptions),
      subscriber: new Redis(redisOptions)
    });
  }

  return new PubSub();
};

export const graphqlPubsub = createPubsubInstance();
