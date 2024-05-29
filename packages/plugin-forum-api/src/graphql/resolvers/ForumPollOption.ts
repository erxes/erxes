import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';
import { PollOption } from '../../db/models/pollOption';

const ForumPollOption: IObjectTypeResolver<PollOption, IContext> = {
  async createdByCp({ createdByCpId }) {
    return (
      createdByCpId && { __typename: 'ClientPortalUser', _id: createdByCpId }
    );
  },

  async createdById({ createdById }) {
    return createdById && { __typename: 'User', _id: createdById };
  },

  async votes({ _id }, { limit = 0, offset = 0 }, { models: { PollVote } }) {
    const votes = await PollVote.find({ pollOptionId: _id })
      .limit(limit)
      .skip(offset)
      .lean();

    return votes.map(vote => ({
      __typename: 'ClientPortal',
      _id: vote.cpUserId
    }));
  },
  async voteCount({ _id }, _, { models: { PollVote } }) {
    return PollVote.countDocuments({ pollOptionId: _id });
  }
};

export default ForumPollOption;
