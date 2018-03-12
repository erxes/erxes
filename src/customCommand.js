import { connect, disconnect } from './db/connection';
import { Customers, Integrations, Conversations, ConversationMessages } from './db/models';

export const customCommand = async () => {
  connect();

  const integrations = await Integrations.find({ kind: 'twitter' });

  for (const integration of integrations) {
    console.log(integration._id);

    const conversations = await Conversations.find({ integrationId: integration._id });
    const conversationIds = conversations.map(c => c._id);

    await ConversationMessages.remove({ conversationId: { $in: conversationIds } });
    await Conversations.remove({ _id: { $in: conversationIds } });
    await Customers.remove({ integrationId: integration._id });
  }

  disconnect();
};

customCommand();
