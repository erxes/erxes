import exmFeedQueries from '../resolvers/queries/exmFeed';
import exmThankQueries from '../resolvers/queries/exmThank';
import exmFeedCommentQueries from '../resolvers/queries/exmFeedComment';
import exmFeedEmojisQueries from '../resolvers/queries/exmFeedEmojis';

export default [
  ...exmFeedQueries,
  ...exmThankQueries,
  ...exmFeedCommentQueries,
  ...exmFeedEmojisQueries
];
