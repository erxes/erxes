import { Conversations } from '../../db/models';

export default {
  conversations(user) {
    return Conversations.find({ participatedUserIds: { $in: [user._id] } });
  },
};
