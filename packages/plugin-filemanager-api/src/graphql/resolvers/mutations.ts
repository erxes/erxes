import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const mutations = {
  filemanagerFolderSave(_root, args, { user, models }: IContext) {
    const { _id, ...doc } = args;

    return models.Folders.saveFolder({
      _id,
      doc: { ...doc, createdUserId: user._id }
    });
  },

  filemanagerFolderRemove(_root, { _id }, { models }: IContext) {
    return models.Folders.deleteOne({ _id });
  },

  filemanagerFolderCreate(_root, doc, { models }: IContext) {
    return models.Files.saveFile({ doc });
  },

  filemanagerFileRemove(_root, { _id }, { models }: IContext) {
    return models.Files.deleteOne({ _id });
  }
};

checkPermission(mutations, 'filemanagerFolderSave', 'manageFilemanager');
checkPermission(mutations, 'filemanagerFolderRemove', 'manageFilemanager');

export default mutations;
