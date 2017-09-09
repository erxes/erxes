import { PubSub } from 'graphql-subscriptions';

import conversations from './conversations';

export const pubsub = new PubSub();

export default {
  ...conversations,
};
