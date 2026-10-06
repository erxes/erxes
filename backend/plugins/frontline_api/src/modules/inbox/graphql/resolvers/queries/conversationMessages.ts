import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { authorizeConversationAccess } from '@/inbox/utils/conversationAccess';
import { IContext } from '~/connectionResolvers';

export const conversationMessageQueries = {
  async conversationMessage(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ConversationMessages.findOne({ _id });
  },
  async conversationPinnedMessages(
    _root: unknown,
    { conversationId }: { conversationId: string },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('showConversations');
    await authorizeConversationAccess(models, user, conversationId);
    return models.ConversationMessages.find({
      conversationId,
      'extraData.discordPinned': true,
      'extraData.discordDeletedAt': null,
    }).sort({ createdAt: -1 });
  },
  /**
   * Get conversation messages
   */
  async conversationMessages(
    _root: unknown,
    {
      conversationId,
      skip,
      limit,
      getFirst,
    }: {
      conversationId: string;
      skip: number;
      limit: number;
      getFirst: boolean;
    },
    { models }: IContext,
  ) {
    const query = { conversationId };

    let messages: IMessageDocument[] = [];

    if (limit) {
      const sort: { createdAt: 1 | -1 } = getFirst
        ? { createdAt: 1 }
        : { createdAt: -1 };

      messages = await models.ConversationMessages.find(query)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit);

      return getFirst ? messages : messages.reverse();
    }

    messages = await models.ConversationMessages.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return messages.reverse();
  },
  /**
   *  Get all conversation messages count. We will use it in pager
   */
  async conversationMessagesTotalCount(
    _root: unknown,
    { conversationId }: { conversationId: string },
    { models }: IContext,
  ) {
    return models.ConversationMessages.countDocuments({ conversationId });
  },
};
