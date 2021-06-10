import { Customers } from '../../db/models';
import { ICommentDocument } from '../../db/models/definitions/forums';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(comment: ICommentDocument) {
    return getDocument('users', { _id: comment.createdBy });
  },

  createdCustomer(comment: ICommentDocument) {
    return Customers.findOne({ _id: comment.createdBy });
  }
};
