// import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const mutations = {
  filemanagerFolderSave(_root, args, { user, models }: IContext) {
    const { _id, ...doc } = args;

    return models.Folders.saveFolder({
      _id,
      doc: { ...doc, createdUserId: user._id }
    });
  },

  async filemanagerFolderRemove(_root, { _id }, { models, user }: IContext) {
    const folder = await models.Folders.getFolder({ _id });

    if (folder.createdUserId !== user._id) {
      throw new Error('Access denied');
    }

    return models.Folders.deleteOne({ _id });
  },

  filemanagerFolderCreate(_root, doc, { models }: IContext) {
    return models.Files.saveFile({ doc });
  },

  async filemanagerFileRemove(_root, { _id }, { models, user }: IContext) {
    const file = await models.Files.getFile({ _id });

    if (file.createdUserId !== user._id) {
      throw new Error('Access denied');
    }

    return models.Files.deleteOne({ _id });
  },

  async filemanagerChangePermission(
    _root,
    { type, _id, userIds, unitId },
    { models, user }: IContext
  ) {
    let collection: any = models.Folders;

    if (type === 'file') {
      collection = models.Files;
    }

    const object = await collection.findOne({ _id });

    if (object.createdUserId !== user._id) {
      throw new Error('Permission denied');
    }

    return collection.update(
      { _id },
      { $set: { permissionConfig: { userIds, unitId } } }
    );
  }
};

// checkPermission(mutations, 'filemanagerFolderSave', 'manageFilemanager');
// checkPermission(mutations, 'filemanagerFolderRemove', 'manageFilemanager');

export default mutations;
