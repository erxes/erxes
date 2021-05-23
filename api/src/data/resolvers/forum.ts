import { ForumTopics } from '../../db/models';
import { IForumDocument } from '../../db/models/definitions/forum';

export default {
  topics(forum: IForumDocument) {
    return ForumTopics.find({
      forumId: forum._id
    });
  }
};
