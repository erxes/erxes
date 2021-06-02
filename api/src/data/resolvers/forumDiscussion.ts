import { IDiscussionDocument } from '../../db/models/definitions/forums';
import { DiscussionComments } from '../../db/models';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(discussion: IDiscussionDocument) {
    return getDocument('users', { _id: discussion.createdBy });
  },

  comments(discussion: IDiscussionDocument) {
    return DiscussionComments.find({ discussionId: discussion._id });
  }
};
