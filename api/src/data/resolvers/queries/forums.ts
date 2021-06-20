import {
  ForumDiscussions,
  Forums,
  ForumTopics,
  DiscussionComments,
  ForumLikes
} from '../../../db/models';

import { IContext } from '../../types';
import { paginate } from '../../utils';
import { checkPermission, requireLogin } from '../../permissions/wrappers';

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
   * Get last topic
   */

  forumTopicsGetLast(_root, _args, { commonQuerySelector }: IContext) {
    return ForumTopics.findOne(commonQuerySelector).sort({
      createdDate: -1
    });
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
  },

  /**
   * discussion comments list
   */
  discussionComments(_root, args: { discussionId: string }) {
    return DiscussionComments.find({ discussionId: args.discussionId });
  },

  /**
   * dicsussion comments total count
   */
  discussionCommentsTotalCount(_root, args: { discussionId: string }) {
    return DiscussionComments.find({
      discussionId: args.discussionId
    }).countDocuments();
  },

  /**
   * userLiked forum like
   */
  async isUserLikedForum(
    _root,
    args: { type: string; contentTypeId: string },
    { user }: IContext
  ) {
    const isLiked = await ForumLikes.findOne({
      type: args.type,
      contentTypeId: args.contentTypeId,
      createdBy: user._id
    });

    if (isLiked) {
      return true;
    }

    return false;
  },

  /**
   * forum likes count
   */
  async forumLikesTotalCount(
    _root,
    args: { type: string; contentTypeId: string }
  ) {
    return ForumLikes.find({
      type: args.type,
      contentTypeId: args.contentTypeId
    }).countDocuments();
  }
};

requireLogin(forumQueries, 'forumsTotalCount');
requireLogin(forumQueries, 'forumTopicsTotalCount');
requireLogin(forumQueries, 'forumTopicsGetLast');
requireLogin(forumQueries, 'forumDiscussionsTotalCount');
requireLogin(forumQueries, 'discussionCommentsTotalCount');
requireLogin(forumQueries, 'forumLikesTotalCount');

checkPermission(forumQueries, 'forums', 'showForums', []);
checkPermission(forumQueries, 'forumTopics', 'showForums', []);
checkPermission(forumQueries, 'forumDiscussions', 'showForums', []);
checkPermission(forumQueries, 'discussionComments', 'showForums', []);
checkPermission(forumQueries, 'isUserLikedForum', 'showForums', []);

export default forumQueries;
