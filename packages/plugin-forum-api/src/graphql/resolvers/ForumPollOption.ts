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

  async votes({ _id }, _, { models: { PollVote } }) {
    return PollVote.find({ pollOptionId: _id }).lean();
  }
};

export default ForumPollOption;
