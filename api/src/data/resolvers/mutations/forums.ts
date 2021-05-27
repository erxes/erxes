import { Forums, ForumTopics, ForumDiscussions } from '../../../db/models';
import {
  IForum,
  ITopic,
  IDiscussion
} from '../../../db/models/definitions/forum';
import { IContext } from '../../types';

const forumMutations = {
  /**
   * Creates a forum document
   */
  async forumsAdd(_root, { doc }: { doc: IForum }, { user }: IContext) {
    const forum = await Forums.createDoc(doc, user._id);
    return forum;
  },

  /**
   * Forum edit
   */
  async forumsEdit(
    _root,
    { _id, doc }: { _id: string; doc: IForum },
    { user }: IContext
  ) {
    const updated = await Forums.updateDoc(_id, doc, user._id);

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
  async forumTopicsAdd(_root, { doc }: { doc: ITopic }, { user }: IContext) {
    const topic = await ForumTopics.createDoc(doc, user._id);

    return topic;
  },

  /**
   * Topic edit
   */

  async forumTopicsEdit(
    _root,
    { _id, doc }: { _id: string; doc: ITopic },
    { user }: IContext
  ) {
    const updated = await ForumTopics.updateDoc(_id, doc, user._id);

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
    { doc }: { doc: IDiscussion },
    { user }: IContext
  ) {
    const discussion = await ForumDiscussions.createDoc(doc, user._id);

    return discussion;
  },

  /**
   * edit discussion document
   */
  async forumDiscussionsEdit(
    _root,
    { _id, doc }: { _id: string; doc: IDiscussion },
    { user }: IContext
  ) {
    const updated = await ForumDiscussions.updateDoc(_id, doc, user._id);

    return updated;
  },

  /**
   * remove discussion document
   */
  async forumDiscussionsRemove(_root, { _id }: { _id: string }) {
    const removed = await ForumDiscussions.removeDoc(_id);

    return removed;
  }
};

export default forumMutations;
