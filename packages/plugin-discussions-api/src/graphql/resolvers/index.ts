import customScalars from '@erxes/api-utils/src/customScalars';
import DiscussionMutations from './discussionMutations';
import DiscussionQueries from './discussionQueries';

const resolvers: any = {
  ...customScalars,
  Mutation: {
    ...DiscussionMutations
  },
  Query: {
    ...DiscussionQueries
  }
};

export default resolvers;
