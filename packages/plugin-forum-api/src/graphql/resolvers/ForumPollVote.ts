import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { PollVote } from '../../db/models/pollVote';

const ForumPollVote: IObjectTypeResolver<PollVote, IContext> = {
  async cpUser({ cpUserId }) {
    return cpUserId && { __typename: 'ClientPortalUser', _id: cpUserId };
  }
};

export default ForumPollVote;
