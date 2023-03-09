// import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const mutations = {
  async filemanagerFolderSave(_root, args, { user, models }: IContext) {
    const { _id, ...doc } = args;

    if (doc.parentId) {
      const parent = await models.Folders.getFolder({ _id: doc.parentId });

      if (parent.createdUserId !== user._id) {
        throw new Error('Permission denied');
      }
    }

    const result = await models.Folders.saveFolder({
      _id,
      doc: { ...doc, createdUserId: user._id }
    });

    await models.Logs.createLog({
      contentType: 'folder',
      contentTypeId: result._id,
      userId: user._id,
      description: 'Created'
    });

    return result;
  },

  async filemanagerFolderRemove(_root, { _id }, { models, user }: IContext) {
    const folder = await models.Folders.getFolder({ _id });

    if (folder.createdUserId !== user._id) {
      throw new Error('Access denied');
    }

    return models.Folders.deleteOne({ _id });
  },

  async filemanagerFileCreate(_root, doc, { models, user }: IContext) {
    const result = await models.Files.saveFile({
      doc: { ...doc, createdUserId: user._id }
    });

    await models.Logs.createLog({
      contentType: 'file',
      contentTypeId: result._id,
      userId: user._id,
      description: 'Created'
    });

    return result;
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
    { models, subdomain, user }: IContext
  ) {
    let collection: any = models.Folders;

    if (type === 'file') {
      collection = models.Files;
    }

    const object = await collection.findOne({ _id });

    if (object.createdUserId !== user._id) {
      throw new Error('Permission denied');
    }

    let sharedUserIds = userIds || [];

    if (unitId) {
      const unit = await sendCoreMessage({
        subdomain,
        action: 'units.findOne',
        data: {
          _id: unitId
        },
        isRPC: true
      });

      sharedUserIds = [...sharedUserIds, ...(unit.userIds || [])];
    }

    const sharedUsers = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: sharedUserIds }
        }
      },
      isRPC: true
    });

    await models.Logs.createLog({
      contentType: type,
      contentTypeId: _id,
      userId: user._id,
      description: `Shared with ${sharedUsers
        .map(u => u.username || u.email)
        .join(' ')}`
    });

    return collection.update(
      { _id },
      { $set: { permissionUserIds: userIds, permissionUnitId: unitId } }
    );
  }
};

// checkPermission(mutations, 'filemanagerFolderSave', 'manageFilemanager');
// checkPermission(mutations, 'filemanagerFolderRemove', 'manageFilemanager');

export default mutations;
