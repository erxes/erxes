import { markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const widgetPollQueries = {
  async widgetsPollVotes(
    _root: undefined,
    {
      conversationId,
      customerId,
      visitorId,
    }: { conversationId: string; customerId?: string; visitorId?: string },
    { models }: IContext,
  ) {
    const voterId = customerId || visitorId;

    if (!voterId) {
      return [];
    }

    const votes = await models.PollVotes.find({
      conversationId,
      voterId,
    }).lean();

    return votes.map((vote) => ({
      messageId: vote.messageId,
      optionIds: vote.optionIds,
    }));
  },
};

markResolvers(widgetPollQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});
