import { IDiscussionDocument } from '../../db/models/definitions/forums';
import {
  DiscussionComments,
  Tags,
  Customers,
  Forums,
  ForumTopics
} from '../../db/models';
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
  },
  pollData(discussion: IDiscussionDocument) {
    const data = discussion.pollData;

    if (!data) {
      return;
    }

    const { pollOptions = [] } = discussion;

    const clearData = { total: 0 };
    let total = 0;

    pollOptions.map(key => {
      clearData[key] = data[key].length;
      total = total + data[key].length;
    });

    clearData.total = total;

    return clearData;
  },
  forum(discussion: IDiscussionDocument) {
    return Forums.findOne({ _id: discussion.forumId });
  },
  topic(discussion: IDiscussionDocument) {
    return ForumTopics.findOne({ _id: discussion.topicId });
  }
};
