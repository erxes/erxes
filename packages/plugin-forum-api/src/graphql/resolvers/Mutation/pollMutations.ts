import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const pollMutations: IObjectTypeResolver<any, IContext> = {
  async forumCpPollVote(_, { _id }, { models: { PollVote }, cpUser }) {
    return PollVote.vote(_id, cpUser);
  },
  async forumCpPollUnvote(_, { _id }, { models: { PollVote }, cpUser }) {
    return PollVote.unvote(_id, cpUser);
  }
};

export default pollMutations;
