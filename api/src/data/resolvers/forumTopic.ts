import { ForumDiscussions, Forums } from '../../db/models';

import { ITopicDocument } from '../../db/models/definitions/forums';
import { paginate } from '../utils';

export default {
  discussions(topic: ITopicDocument, _params, _context, { variableValues }) {
    return paginate(
      ForumDiscussions.find({ topicId: topic._id }),
      variableValues
    ).sort({ modifiedDate: -1 });
  },
  forum(topic: ITopicDocument) {
    return Forums.findOne({ _id: topic.forumId });
  }
};
