import { Conversations } from '../../../db/models';

export default {
  conversations(root, { limit }) {
    const conversations = Conversations.find({});

    if (limit) {
      return conversations.limit(limit);
    }

    return conversations;
  },
};
