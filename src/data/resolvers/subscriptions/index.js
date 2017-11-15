import { PubSub } from 'graphql-subscriptions';

import conversations from './conversations';
import notifications from './notifications';

export const pubsub = new PubSub();

export default {
  ...conversations,
  ...notifications,
};
