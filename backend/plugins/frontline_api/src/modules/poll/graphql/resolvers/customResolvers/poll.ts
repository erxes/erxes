import { IPollDocument } from '@/poll/@types/poll';
import { IContext } from '~/connectionResolvers';

export const Poll = {
  async createdUser(poll: IPollDocument) {
    if (!poll.createdUserId) {
      return null;
    }

    return { __typename: 'User', _id: poll.createdUserId };
  },

  async channel(poll: IPollDocument, _params, { models }: IContext) {
    if (!poll.channelId) {
      return null;
    }

    return models.Channels.findOne({ _id: poll.channelId });
  },

  async results(poll: IPollDocument, _params, { models }: IContext) {
    const [answerCounts, voterCount] = await Promise.all([
      models.PollVotes.countByOption({ pollId: poll._id }),
      models.PollVotes.countVoters({ pollId: poll._id }),
    ]);

    const countById = new Map(answerCounts.map((row) => [row.id, row.count]));
    const totalVotes = answerCounts.reduce((sum, row) => sum + row.count, 0);

    return {
      totalVotes,
      voterCount,
      options: [...poll.options]
        .sort((a, b) => a.order - b.order)
        .map((option) => {
          const count = countById.get(option._id) || 0;

          return {
            _id: option._id,
            text: option.text,
            count,
            percent: totalVotes ? Math.round((count / totalVotes) * 100) : 0,
          };
        }),
    };
  },
};
