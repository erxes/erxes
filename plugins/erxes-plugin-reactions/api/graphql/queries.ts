import commentQueries from '../resolvers/queries/comments';
import emojiQueries from '../resolvers/queries/emojis';

export default [...commentQueries, ...emojiQueries];
