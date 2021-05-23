import { ForumDiscussions } from '../../db/models';

import { ITopicDocument } from '../../db/models/definitions/forum';

export default {
  discussions(topic: ITopicDocument) {
    return ForumDiscussions.find({ topicId: topic._id });
  }
};
