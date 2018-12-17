import { connect, disconnect } from '../db/connection';
import { ConversationMessages, Conversations } from '../db/models';

export const customCommand = async () => {
  connect();

  const conversations = await Conversations.find({ facebookData: { $exists: true } });

  const msgs = await ConversationMessages.find({ 'facebookData.commentId': { $exists: true } });

  disconnect();
};
