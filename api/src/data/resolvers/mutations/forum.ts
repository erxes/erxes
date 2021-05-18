import { Forums } from '../../../db/models';
import { IForum } from '../../../db/models/definitions/forum';

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
  }
};

export default forumMutations;
