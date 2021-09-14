import exmFeedMutations from '../resolvers/mutations/exmFeed';
import exmThankMutations from '../resolvers/mutations/exmThank';
import exmFeedCommentMutations from '../resolvers/mutations/exmFeedComment';

export default [
  ...exmFeedMutations,
  ...exmThankMutations,
  ...exmFeedCommentMutations
];
