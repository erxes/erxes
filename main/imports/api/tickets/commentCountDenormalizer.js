import { Comments } from './comments.js';
import { Tickets } from './tickets.js';

const commentCountDenormalizer = {
  _updateTicket(ticketId) {
    // Recalculate the correct comment count direct from MongoDB
    const commentCount = Comments.find({
      ticketId,
    }).count();

    Tickets.update(ticketId, { $set: { commentCount } });
  },

  afterInsertComment(comment) {
    this._updateTicket(comment.ticketId);
  },

  // Here we need to take the list of comments being removed, selected *before* the update because
  // otherwise we can't figure out the relevant comment id(s) (if the comment has been deleted)
  afterRemoveComments(comments) {
    comments.forEach(comment => this._updateTicket(comment.ticketId));
  },
};

export default commentCountDenormalizer;
