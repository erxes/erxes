import { connect, disconnect } from '../db/connection';
import { ConversationMessages, Conversations } from '../db/models';

module.exports.up = async () => {
  await connect();

  console.log('start migration to add customerId to popup messages');

  const popupMessages = await ConversationMessages.find({
    customerId: { $exists: false },
    formWidgetData: { $exists: true },
  });

  for (const message of popupMessages) {
    const conversation = await Conversations.findOne({ _id: message.conversationId });

    if (conversation && conversation.customerId) {
      await ConversationMessages.updateOne({ _id: message._id }, { $set: { customerId: conversation.customerId } });
    }
  }

  await disconnect();
};
