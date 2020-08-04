import * as dotenv from 'dotenv';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';
import { redisOptions } from './redisClient';

// load environment variables
dotenv.config();

const { NODE_ENV, PROCESS_NAME } = process.env;

const createPubsubInstance = () => {
  let pubsub;

  if (NODE_ENV === 'test' || NODE_ENV === 'command' || PROCESS_NAME === 'crons') {
    pubsub = {
      asyncIterator: () => null,
      publish: () => null,
    };

    return pubsub;
  }

  return new RedisPubSub({
    connectionListener: error => {
      if (error) {
        console.error(error);
      }
    },
    publisher: new Redis(redisOptions),
    subscriber: new Redis(redisOptions),
  });
};

export const graphqlPubsub = createPubsubInstance();
