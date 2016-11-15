import { Comments } from './comments.js';
import { Conversations } from './conversations.js';

const commentCountDenormalizer = {
  _updateConversation(conversationId) {
    // Recalculate the correct comment count direct from MongoDB
    const commentCount = Comments.find({
      conversationId,
    }).count();

    Conversations.update(conversationId, { $set: { commentCount } });
  },

  afterInsertComment(comment) {
    this._updateConversation(comment.conversationId);
  },

  // Here we need to take the list of comments being removed, selected *before* the update because
  // otherwise we can't figure out the relevant comment id(s) (if the comment has been deleted)
  afterRemoveComments(comments) {
    comments.forEach(comment => this._updateConversation(comment.conversationId));
  },
};

export default commentCountDenormalizer;
