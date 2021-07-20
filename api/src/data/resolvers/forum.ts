import { ForumTopics } from '../../db/models';
import { IForumDocument } from '../../db/models/definitions/forums';
import { getDocument } from './mutations/cacheUtils';

export default {
  topics(forum: IForumDocument) {
    return ForumTopics.find({
      forumId: forum._id
    });
  },

  brand(forum: IForumDocument) {
    return getDocument('brands', { _id: forum.brandId });
  }
};
