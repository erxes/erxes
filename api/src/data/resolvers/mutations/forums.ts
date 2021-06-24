import {
  Forums,
  ForumTopics,
  ForumDiscussions,
  DiscussionComments,
  ForumReactions
} from '../../../db/models';
import {
  IForum,
  ITopic,
  IDiscussion,
  IComment,
  IForumReaction
} from '../../../db/models/definitions/forums';
import { IContext } from '../../types';
import { moduleCheckPermission } from '../../permissions/wrappers';

const forumMutations = {
  /**
   * Creates a forum document
   */
  async forumsAdd(
    _root,
    { ...doc }: { doc: IForum },
    { user, docModifier }: IContext
  ) {
    const forum = await Forums.createDoc(docModifier(doc), user._id);
    return forum;
  },

  /**
   * Forum edit
   */
  async forumsEdit(
    _root,
    { _id, ...doc }: { _id: string; doc: IForum },
    { user, docModifier }: IContext
  ) {
    const updated = await Forums.updateDoc(_id, docModifier(doc), user._id);

    return updated;
  },

  /**
   * Forum remove
   */
  async forumsRemove(_root, { _id }: { _id: string }) {
    const removed = await Forums.removeDoc(_id);

    return removed;
  },

  /**
   * Create topic document
   */
  async forumTopicsAdd(
    _root,
    { ...doc }: { doc: ITopic },
    { user, docModifier }: IContext
  ) {
    const topic = await ForumTopics.createDoc(docModifier(doc), user._id);

    return topic;
  },

  /**
   * Topic edit
   */

  async forumTopicsEdit(
    _root,
    { _id, ...doc }: { _id: string; doc: ITopic },
    { user, docModifier }: IContext
  ) {
    const updated = await ForumTopics.updateDoc(
      _id,
      docModifier(doc),
      user._id
    );

    return updated;
  },

  /**
   * Topic remove
   */
  async forumTopicsRemove(_root, { _id }: { _id: string }) {
    const removed = await ForumTopics.removeDoc(_id);

    return removed;
  },

  /**
   * create discussion document
   */
  async forumDiscussionsAdd(
    _root,
    { ...doc }: { doc: IDiscussion },
    { user, docModifier }: IContext
  ) {
    const discussion = await ForumDiscussions.createDoc(
      docModifier(doc),
      user._id
    );

    return discussion;
  },

  /**
   * edit discussion document
   */
  async forumDiscussionsEdit(
    _root,
    { _id, ...doc }: { _id: string; doc: IDiscussion },
    { user, docModifier }: IContext
  ) {
    const updated = await ForumDiscussions.updateDoc(
      _id,
      docModifier(doc),
      user._id
    );

    return updated;
  },

  /**
   * remove discussion document
   */
  async forumDiscussionsRemove(_root, { _id }: { _id: string }) {
    const removed = await ForumDiscussions.removeDoc(_id);

    return removed;
  },

  /**
   * add discussion comments
   */
  async discussionCommentsAdd(
    _root,
    { ...doc }: { doc: IComment },
    { user, docModifier }: IContext
  ) {
    const comment = DiscussionComments.createDoc(docModifier(doc), user._id);

    return comment;
  },

  /**
   * edit discussion comments
   */
  async discussionCommentsEdit(
    _root,
    { _id, ...doc }: { _id: string; doc: IComment },
    { user, docModifier }: IContext
  ) {
    const updated = DiscussionComments.updateDoc(
      _id,
      docModifier(doc),
      user._id
    );

    return updated;
  },

  /**
   * remove discussion comments
   */
  async discussionCommentsRemove(_root, { _id }: { _id: string }) {
    const removed = await DiscussionComments.removeDoc(_id);

    return removed;
  },

  /**
   * Forum reaction mutations
   */
  async forumReactionsToggle(
    _root,
    { ...doc }: { doc: IForumReaction; type: string; contentTypeId: string },
    { user, docModifier }: IContext
  ) {
    const userReaction = await ForumReactions.findOne({
      createdBy: user._id,
      type: doc.type,
      contentTypeId: doc.contentTypeId
    });

    if (userReaction) {
      return ForumReactions.deleteOne({
        createdBy: user._id,
        contentTypeId: doc.contentTypeId
      });
    }

    const reaction = await ForumReactions.createDoc(docModifier(doc), user._id);

    return reaction;
  }
};

moduleCheckPermission(forumMutations, 'manageForums');

export default forumMutations;
