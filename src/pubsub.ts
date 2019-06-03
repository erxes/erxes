import * as dotenv from 'dotenv';
import * as Redis from 'ioredis';

// load environment variables
dotenv.config();

const {
  REDIS_HOST = 'localhost',
  REDIS_PORT = 6379,
  REDIS_PASSWORD = '',
}: {
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
} = process.env;

// Docs on the different redis options
// https://github.com/NodeRedis/node_redis#options-object-properties
const redisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  connect_timeout: 15000,
  enable_offline_queue: true,
  retry_unfulfilled_commands: true,
  retry_strategy: options => {
    // reconnect after
    return Math.max(options.attempt * 100, 3000);
  },
};

const broker = new Redis(redisOptions);

export const publish = (action: string, data) => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV !== 'production') {
    return;
  }

  return broker.publish(
    'widgetNotification',
    JSON.stringify({
      action,
      data,
    }),
  );
};
