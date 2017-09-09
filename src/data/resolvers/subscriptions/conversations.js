import { pubsub } from './';

export default {
  conversationMessageAdded: {
    subscribe: () => pubsub.asyncIterator('conversationMessageAdded'),
  },
};
