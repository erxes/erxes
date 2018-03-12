import { Conversations } from '../../db/models';

export default {
  participatedConversations(user) {
    return Conversations.find({ participatedUserIds: { $in: [user._id] } });
  },
};
