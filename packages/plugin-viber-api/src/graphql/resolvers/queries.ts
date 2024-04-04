import { IContext } from '../../connectionResolver';
import {
  Conversations,
  ConversationMessages,
  Integrations,
  IConversationMessages
} from '../../models';

const queries = {
  async viberConversationDetail(
    _root,
    { conversationId },
    context: IContext
  ): Promise<IConversationMessages[]> {
    let conversation: any = await Conversations.findOne(
      { erxesApiId: conversationId },
      '_id'
    );

    if (conversation) {
      const messages = ConversationMessages.find({
        conversationId: conversation._id
      }).sort('createdAt');
      return messages;
    }

    return [];
  },

  async viberConversationMessages(
    _root,
    args: any,
    context: IContext
  ): Promise<any[]> {
    const query: { conversationId: string } = { conversationId: '' };
    const { conversationId, limit, skip, getFirst } = args;

    let messages: any[] = [];

    const conversation = await Conversations.findOne(
      { erxesApiId: conversationId },
      '_id'
    );

    if (conversation) {
      query.conversationId = conversation._id;
    }

    if (limit) {
      const sort: { createdAt: number } = getFirst
        ? { createdAt: 1 }
        : { createdAt: -1 };

      messages = await ConversationMessages.find(query)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit);

      return getFirst ? messages : messages.reverse();
    }

    messages = await ConversationMessages.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return messages.reverse();
  },

  async viberConversationMessagesCount(
    _root,
    { conversationId }: { conversationId: string },
    context: IContext
  ) {
    const conversation = await Conversations.findOne(
      { erxesApiId: conversationId },
      '_id'
    );

    if (conversation) {
      return ConversationMessages.countDocuments({
        conversationId: conversation._id
      });
    }

    return 0;
  },

  async viberIntegrationDetail(
    _root,
    { integrationId }: { integrationId: string },
    context: IContext
  ): Promise<any> {
    const integration = await Integrations.findOne({ inboxId: integrationId });
    return integration;
  }
};

export default queries;
