import { markResolvers } from 'erxes-api-shared/utils';
import {
  buildPollSnapshot,
  getActivePoll,
  getCpVoterId,
  isPollClosed,
} from '@/poll/utils';
import { IContext } from '~/connectionResolvers';

export const cpPollQueries = {
  async cpPollDetail(
    _root: undefined,
    {
      channelId,
      pollCode,
      visitorId,
    }: { channelId: string; pollCode: string; visitorId?: string },
    { models, cpUser }: IContext,
  ) {
    const channel = await models.Channels.findOne({ _id: channelId }).lean();
    const poll = await getActivePoll(models, pollCode);

    if (!channel || !poll || poll.channelId !== channelId) {
      throw new Error('Invalid configuration');
    }

    if (isPollClosed(buildPollSnapshot(poll))) {
      return { poll: null, votedOptionIds: [] };
    }

    const voterId = getCpVoterId(cpUser, visitorId);

    if (!voterId) {
      return { poll, votedOptionIds: [] };
    }

    const vote = await models.PollVotes.findOne({
      pollId: poll._id,
      voterId,
    }).lean();

    return { poll, votedOptionIds: vote?.optionIds || [] };
  },

  async cpPollVotes(
    _root: undefined,
    {
      conversationId,
      visitorId,
    }: { conversationId: string; visitorId?: string },
    { models, cpUser }: IContext,
  ) {
    const voterId = getCpVoterId(cpUser, visitorId);

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

markResolvers(cpPollQueries, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
