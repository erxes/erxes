import exmFeedQueries from '../resolvers/queries/exmFeed';
import exmThankQueries from '../resolvers/queries/exmThank';
import exmFeedCommentQueries from '../resolvers/queries/exmFeedComment';

export default [
  ...exmFeedQueries,
  ...exmThankQueries,
  ...exmFeedCommentQueries
];
