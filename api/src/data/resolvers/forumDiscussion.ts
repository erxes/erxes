import { IDiscussionDocument } from '../../db/models/definitions/forums';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(discussion: IDiscussionDocument) {
    return getDocument('users', { _id: discussion.createdBy });
  }
};
