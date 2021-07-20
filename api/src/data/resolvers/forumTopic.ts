import { ForumDiscussions, Forums } from '../../db/models';

import { ITopicDocument } from '../../db/models/definitions/forums';

export default {
  discussions(topic: ITopicDocument) {
    return ForumDiscussions.find({ topicId: topic._id });
  },
  forum(topic: ITopicDocument) {
    return Forums.findOne({ _id: topic.forumId });
  }
};
