import commentMutations from '../resolvers/mutations/comments';
import emojiMutations from '../resolvers/mutations/emojis';

export default [...commentMutations, ...emojiMutations];
