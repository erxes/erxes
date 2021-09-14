import exmFeedMutations from '../resolvers/mutations/exmFeed';
import exmThankMutations from '../resolvers/mutations/exmThank';
import exmFeedCommentMutations from '../resolvers/mutations/exmFeedComment';
import exmFeedEmojiMutations from '../resolvers/mutations/exmFeedEmoji';

export default [
  ...exmFeedMutations,
  ...exmThankMutations,
  ...exmFeedCommentMutations,
  ...exmFeedEmojiMutations
];
