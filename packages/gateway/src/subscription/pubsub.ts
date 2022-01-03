import * as dotenv from "dotenv";
dotenv.config();
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || "6379"),
  password: REDIS_PASSWORD,
});

const pubsub = new RedisPubSub({
  connectionListener: (error) => {
    if(error) {
        console.log(error);
    }
  },
  publisher: redis,
  subscriber: redis,
});

export default pubsub;
