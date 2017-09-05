import { EngageMessages } from '../../../db/models';

export default {
  engageMessages(root, { limit }) {
    const engageMessages = EngageMessages.find({});

    if (limit) {
      return engageMessages.limit(limit);
    }

    return engageMessages;
  },

  engageMessageDetail(root, { _id }) {
    return EngageMessages.findOne({ _id });
  },

  totalEngageMessagesCount() {
    return EngageMessages.find({}).count();
  },
};
