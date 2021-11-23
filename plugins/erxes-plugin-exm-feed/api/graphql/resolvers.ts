import exmFeedResolvers from '../resolvers/exmFeed';
import exmThankResolvers from '../resolvers/exmThank';
import exmFeedCommentResolvers from '../resolvers/exmFeedComment';

const resolvers = [
  ...exmFeedResolvers,
  ...exmThankResolvers,
  ...exmFeedCommentResolvers
];

export default resolvers;
