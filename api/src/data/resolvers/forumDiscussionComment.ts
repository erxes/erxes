import { Customers, ForumReactions } from '../../db/models';
import { ICommentDocument } from '../../db/models/definitions/forums';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(comment: ICommentDocument) {
    return getDocument('users', { _id: comment.createdBy });
  },

  createdCustomer(comment: ICommentDocument) {
    return Customers.findOne({ _id: comment.createdBy });
  },
  async currentCustomerReaction(
    comment: ICommentDocument,
    _params,
    _context,
    { variableValues }
  ) {
    const reaction = await ForumReactions.findOne({
      contentType: 'comment',
      contentTypeId: comment._id,
      createdBy: variableValues.currentCustomerId
    });

    return reaction?.type;
  },
  reactionTotalCount(comment: ICommentDocument) {
    return ForumReactions.find({ contentTypeId: comment._id }).countDocuments();
  }
};
