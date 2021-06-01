import { ICommentDocument } from '../../db/models/definitions/forums';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(comment: ICommentDocument) {
    return getDocument('users', { _id: comment.createdBy });
  }
};
