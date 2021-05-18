import { Forums, ForumTopics } from '../../../db/models';

import { IContext } from '../../types';
import { paginate } from '../../utils';

const forumQueries = {
  /**
   * Forum list
   */

  forums(
    _root,
    args: { page: number; perPage: number },
    { commonQuerySelector }: IContext
  ) {
    const forums = paginate(Forums.find(commonQuerySelector), args);
    return forums.sort({ modifiedDate: -1 });
  },

  /**
   * Forum detail
   */
  forumDetail(_root, { _id }: { _id: string }) {
    return Forums.findOne({ _id });
  },

  /**
   * Forums total count
   */
  forumsTotalCount(_root, _args, { commonQuerySelector }: IContext) {
    return Forums.find(commonQuerySelector).countDocuments();
  },

  /**
   * ForumTopics list
   */
  forumTopics(
    _root,
    args: { page: number; perPage: number },
    { commonQuerySelector }: IContext
  ) {
    const topics = paginate(ForumTopics.find(commonQuerySelector), args);
    return topics.sort({ modifiedDate: -1 });
  },

  /**
   * Topic Detail
   */
  forumTopicDetail(_root, { _id }: { _id: string }) {
    return ForumTopics.findOne({ _id });
  },

  /**
   *  Topic count total
   */
  forumTopicsTotalCount(_root, _args, { commonQuerySelector }: IContext) {
    return ForumTopics.find(commonQuerySelector).countDocuments();
  }
};

export default forumQueries;
