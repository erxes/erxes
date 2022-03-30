import ExmFeeds from './exmFeed';
import ExmThanks from './exmThank';

import exmFeedMutations from './mutations';
import exmThankMutations from './mutations';

import exmFeedQueries from './queries';
import exmThankQueries from './queries';

const resolvers: any = async () => ({
  ExmFeeds,
  ExmThanks,
  Mutation: {
    ...exmFeedMutations,
    ...exmThankMutations,
  },
  Query: {
    ...exmFeedQueries,
    ...exmThankQueries,
  },
});

export default resolvers;
