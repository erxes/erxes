import { IContext } from '../../connectionResolver';
import { IFolderDocument } from '../../models';

export const folder = {
  async parent(root: IFolderDocument, _args, { models }: IContext) {
    if (!root.parentId) {
      return null;
    }

    return models.Folders.findOne({ _id: root.parentId });
  }
};
