import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const redisConnectionListener = error => {
  if (error) {
    console.error(error); // eslint-disable-line no-console
  }
};

// Docs on the different redis options
// https://github.com/NodeRedis/node_redis#options-object-properties
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  connect_timeout: 15000,
  enable_offline_queue: true,
  retry_unfulfilled_commands: true,
  retry_strategy: options => {
    // reconnect after
    return Math.max(options.attempt * 100, 3000);
  },
};

const pubsub = new RedisPubSub({
  connectionListener: redisConnectionListener,
  publisher: new Redis(redisOptions),
  subscriber: new Redis(redisOptions),
});

export default pubsub;
