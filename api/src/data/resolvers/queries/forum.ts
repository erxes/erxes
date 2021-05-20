import { ForumDiscussions, Forums, ForumTopics } from '../../../db/models';

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
  forumTopics(_root, args: { page: number; perPage: number; forumId: string }) {
    const topics = ForumTopics.find({ forumId: args.forumId }).sort({
      title: 1
    });

    return paginate(topics, args);
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
  forumTopicsTotalCount(_root, args: { forumId: string }) {
    return ForumTopics.find({ forumId: args.forumId }).countDocuments();
  },

  /**
   * Discussions List
   */

  forumDiscussions(
    _root,
    args: { page: number; perPage: number; topicId: string }
  ) {
    const discussions = ForumDiscussions.find({ topicId: args.topicId }).sort({
      createdDate: -1
    });

    return paginate(discussions, args);
  },

  /**
   * Discussion detail
   */
  forumDiscussionDetail(_root, { _id }: { _id: string }) {
    return ForumDiscussions.findOne({ _id });
  },

  /**
   * Discussions total count
   */
  forumDiscussionsTotalCount(_root, args: { topicId: string }) {
    return ForumDiscussions.find({ topicId: args.topicId }).countDocuments();
  }
};

export default forumQueries;
