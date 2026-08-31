import { IPollInput } from '@/poll/db/models/Polls';
import { buildPollSnapshot } from '@/poll/utils';
import { POLL_STATUSES } from '@/poll/db/definitions/polls';
import { publishMessage } from '@/inbox/graphql/resolvers/mutations/conversations';
import { IContext } from '~/connectionResolvers';

export const pollMutations = {
  async pollAdd(_root: undefined, doc: IPollInput, { models, user }: IContext) {
    return models.Polls.createPoll(doc, user._id);
  },

  async pollEdit(
    _root: undefined,
    { _id, ...doc }: IPollInput & { _id: string },
    { models }: IContext,
  ) {
    return models.Polls.updatePoll(_id, doc);
  },

  async pollRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Polls.removePolls(_ids);
  },

  async pollToggleStatus(
    _root: undefined,
    { _ids, status }: { _ids: string[]; status: string },
    { models }: IContext,
  ) {
    return models.Polls.changeStatus(_ids, status);
  },

  async pollSendToConversation(
    _root: undefined,
    { _id, conversationId }: { _id: string; conversationId: string },
    { models, user }: IContext,
  ) {
    const poll = await models.Polls.getPoll(_id);

    if (poll.status !== POLL_STATUSES.ACTIVE) {
      throw new Error('Only an active poll can be sent');
    }

    const conversation =
      await models.Conversations.getConversation(conversationId);

    const integration = await models.Integrations.getIntegration({
      _id: conversation.integrationId,
    });

    if (integration.kind !== 'messenger') {
      throw new Error('Polls can only be sent to messenger conversations');
    }

    if (poll.channelId && poll.channelId !== integration.channelId) {
      throw new Error('This poll belongs to another channel');
    }

    const message = await models.ConversationMessages.addMessage(
      {
        conversationId,
        content: poll.question,
        internal: false,
        extraData: { poll: buildPollSnapshot(poll) },
      },
      user._id,
    );

    const dbMessage = await models.ConversationMessages.getMessage(message._id);

    await models.Conversations.updateConversation(conversationId, {
      hasPoll: true,
    });

    await models.Polls.increaseSentCount(poll._id);

    await publishMessage(models, dbMessage, conversation.customerId);

    return dbMessage;
  },
};
