import { IDiscussionDocument } from '../../db/models/definitions/forums';
import { DiscussionComments, Tags, Customers } from '../../db/models';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(discussion: IDiscussionDocument) {
    return getDocument('users', { _id: discussion.createdBy });
  },

  comments(discussion: IDiscussionDocument) {
    return DiscussionComments.find({ discussionId: discussion._id });
  },
  getTags(discussion: IDiscussionDocument) {
    return Tags.find({ _id: { $in: discussion.tagIds || [] } });
  },
  createdCustomer(discussion: IDiscussionDocument) {
    return Customers.findOne({ _id: discussion.createdBy });
  }
};
