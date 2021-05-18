import { Forums, ForumTopics, ForumDiscussions } from '../../../db/models';
import {
  IForum,
  ITopic,
  IDiscussion
} from '../../../db/models/definitions/forum';

const forumMutations = {
  /**
   * Creates a forum document
   */
  async forumsAdd(_root, { doc }: { doc: IForum }) {
    const forum = await Forums.createDoc(doc);
    return forum;
  },

  /**
   * Forum edit
   */
  async forumsEdit(_root, { _id, doc }: { _id: string; doc: IForum }) {
    const updated = await Forums.updateDoc(_id, doc);

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
  async forumTopicsAdd(_root, { doc }: { doc: ITopic }) {
    const topic = await ForumTopics.createDoc(doc);

    return topic;
  },

  /**
   * Topic edit
   */

  async forumTopicsEdit(_root, { _id, doc }: { _id: string; doc: ITopic }) {
    const updated = await ForumTopics.updateDoc(_id, doc);

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
  async forumDiscussionsAdd(_root, { doc }: { doc: IDiscussion }) {
    const discussion = await ForumDiscussions.createDoc(doc);

    return discussion;
  },

  /**
   * edit discussion document
   */
  async forumDiscussionsEdit(
    _root,
    { _id, doc }: { _id: string; doc: IDiscussion }
  ) {
    const updated = await ForumDiscussions.updateDoc(_id, doc);

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
