import { markResolvers } from 'erxes-api-shared/utils';
import { IPollSnapshot } from '@/poll/@types/poll';
import { isPollClosed, refreshPollTallies } from '@/poll/utils';
import { IContext } from '~/connectionResolvers';

export const widgetPollMutations = {
  async widgetsPollVote(
    _root: undefined,
    {
      messageId,
      optionIds,
      customerId,
      visitorId,
    }: {
      messageId: string;
      optionIds: string[];
      customerId?: string;
      visitorId?: string;
    },
    { models, subdomain }: IContext,
  ) {
    const voterId = customerId || visitorId;

    if (!voterId) {
      throw new Error('A customer or visitor is required to vote');
    }

    const message = await models.ConversationMessages.getMessage(messageId);

    const snapshot = (message.extraData as { poll?: IPollSnapshot } | undefined)
      ?.poll;

    if (!snapshot?.pollId) {
      throw new Error('This message does not carry a poll');
    }

    if (isPollClosed(snapshot)) {
      throw new Error('This poll is closed');
    }

    const selected = [...new Set(optionIds)];

    if (selected.length === 0) {
      throw new Error('Select at least one option');
    }

    if (!snapshot.allowMultiselect && selected.length > 1) {
      throw new Error('This poll allows only one answer');
    }

    const known = new Set(snapshot.answers.map((answer) => answer.id));

    if (selected.some((optionId) => !known.has(optionId))) {
      throw new Error('Unknown poll option');
    }

    await models.PollVotes.castVote({
      pollId: snapshot.pollId,
      messageId,
      conversationId: message.conversationId || '',
      voterId,
      customerId,
      visitorId,
      optionIds: selected,
    });

    return refreshPollTallies(models, subdomain, messageId);
  },
};

markResolvers(widgetPollMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
