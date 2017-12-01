import { RedisPubSub } from 'graphql-redis-subscriptions';

const redisConnectionListener = error => {
  if (error) {
    console.error(error); // eslint-disable-line no-console
  }
};

// Docs on the different redis options
// https://github.com/NodeRedis/node_redis#options-object-properties
const redisOptions = {
  host: 'localhost',
  port: 6379,
  connect_timeout: 15000,
  enable_offline_queue: true,
  retry_unfulfilled_commands: true,
};

const pubsub = new RedisPubSub({
  connection: redisOptions,
  connectionListener: redisConnectionListener,
});

export default pubsub;
