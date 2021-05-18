import { Forums } from '../../../db/models';
import { IForum } from '../../../db/models/definitions/forum';

const forumMutations = {
  /**
   * Creates a forum document
   */

  async forumsAdd(_root, { doc }: { doc: IForum }) {
    const forum = await Forums.createDoc(doc);
    return forum;
  }
};

export default forumMutations;
