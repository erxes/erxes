import { connect, disconnect } from '../db/connection';
import { ConversationMessages, Conversations } from '../db/models';

export const customCommand = async () => {
  connect();

  const conversations = await Conversations.find({
    firstRespondedUserId: null,
    firstRespondedDate: null,
    messageCount: { $gt: 1 },
  })
    .select('_id')
    .sort({ createdAt: -1 });

  for (const { _id } of conversations) {
    // First message that answered to a conversation
    const message = await ConversationMessages.findOne({
      conversationId: _id,
      userId: { $ne: null },
    }).sort({ createdAt: 1 });

    if (message) {
      await Conversations.updateOne(
        { _id },
        {
          $set: {
            firstRespondedUserId: message.userId,
            firstRespondedDate: message.createdAt,
          },
        },
      );
    }
  }

  disconnect();
};

customCommand();
