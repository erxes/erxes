import { connect, disconnect } from '../db/connection';
import { Conversations, ConversationMessages } from '../db/models';

export const customCommand = async () => {
  connect();

  const conversations = await Conversations.find({ facebookData: { $exists: true } });

  for (let conversation of conversations) {
    await ConversationMessages.remove({ conversationId: conversation._id });

    await Conversations.remove({ _id: conversation._id });
  }

  disconnect();
};

customCommand();
