import { IContext } from '../../connectionResolver';
import { IFolderDocument } from '../../models';

export const folder = {
  async parent(root: IFolderDocument, _args, { models }: IContext) {
    if (!root.parentId) {
      return null;
    }

    return models.Folders.findOne({ _id: root.parentId });
  },

  async hasChild(root: IFolderDocument, _args, { models }: IContext) {
    const count = await models.Folders.find({ parentId: root._id }).count();

    return count > 0;
  }
};
