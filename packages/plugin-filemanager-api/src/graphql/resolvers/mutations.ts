import { checkPermission } from '@erxes/api-utils/src/permissions';
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

    const filesCount = await models.Files.find({ folderId: _id }).count();

    if (filesCount > 0) {
      throw new Error('This folder contains files');
    }

    const subFoldersCount = await models.Folders.find({
      parentId: _id
    }).count();

    if (subFoldersCount > 0) {
      throw new Error('This folder contains folders');
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
  },

  async filemanagerRequestAcks(
    _root,
    { fileId, description },
    { user, models, subdomain }: IContext
  ) {
    const file = await models.Files.getFile({ _id: fileId });

    const unit = await sendCoreMessage({
      subdomain,
      action: 'units.find',
      data: {
        _id: file.permissionUnitId
      },
      isRPC: true
    });

    const totalUserIds = [
      ...(file.permissionUserIds || []),
      ...(unit.memberIds || [])
    ];

    for (const userId of totalUserIds) {
      // ignore owner
      if (userId === user._id) {
        continue;
      }

      const request = await models.AckRequests.findOne({
        fileId,
        toUserId: userId
      });

      if (request) {
        continue;
      }

      await models.AckRequests.createRequest({
        fileId,
        fromUserId: user._id,
        toUserId: userId,
        description,
        status: 'requested'
      });
    }

    await models.Logs.createLog({
      contentType: 'file',
      contentTypeId: file._id,
      userId: user._id,
      description: 'Requested acknowledgement'
    });

    return 'ok';
  },

  async filemanagerAckRequest(_root, { _id }, { user, models }: IContext) {
    const request = await models.AckRequests.findOne({ _id });

    if (!request || (request && request.toUserId !== user._id)) {
      throw new Error('Permission denied');
    }

    const response = await models.AckRequests.update(
      { _id },
      { $set: { status: 'acked' } }
    );

    await models.Logs.createLog({
      contentType: 'file',
      contentTypeId: request.fileId,
      userId: user._id,
      description: `Acknowledged`
    });

    return response;
  },

  async filemanagerRequestAccess(
    _root,
    { fileId, description },
    { user, models }: IContext
  ) {
    const request = await models.AccessRequests.findOne({
      fileId,
      fromUserId: user._id
    });

    if (request) {
      return 'already requested';
    }

    await models.AccessRequests.createRequest({
      fileId,
      fromUserId: user._id,
      description,
      status: 'requested'
    });

    await models.Logs.createLog({
      contentType: 'file',
      contentTypeId: fileId,
      userId: user._id,
      description: 'Access request created'
    });

    return 'ok';
  },

  async filemanagerConfirmAccessRequest(
    _root,
    { requestId },
    { user, models }: IContext
  ) {
    const request = await models.AccessRequests.findOne({ _id: requestId });

    if (!request) {
      throw new Error('Not found');
    }

    const file = await models.Files.getFile({ _id: request.fileId });

    if (file.createdUserId !== user._id) {
      throw new Error('Permission denied');
    }

    await models.Logs.createLog({
      contentType: 'file',
      contentTypeId: file._id,
      userId: user._id,
      description: 'Access request confirmed'
    });

    await models.Files.update(
      { _id: file._id },
      { $push: { permissionUserIds: request.fromUserId } }
    );
    await models.AccessRequests.remove({ _id: requestId });

    return 'ok';
  },

  async filemanagerRelateFiles(
    _root,
    { sourceId, targetIds },
    { user, models }: IContext
  ) {
    const file = await models.Files.getFile({ _id: sourceId });

    if (file.createdUserId !== user._id) {
      throw new Error('Permission denied');
    }

    await models.Files.update(
      { _id: sourceId },
      { $set: { relatedFileIds: targetIds } }
    );

    return 'ok';
  },

  async filemanagerRemoveRelatedFiles(
    _root,
    { sourceId, targetIds },
    { user, models }: IContext
  ) {
    const file = await models.Files.getFile({ _id: sourceId });

    if (file.createdUserId !== user._id) {
      throw new Error('Permission denied');
    }

    for (const targetId of targetIds) {
      await models.Files.update(
        { _id: sourceId },
        { $pull: { relatedFileIds: targetId } }
      );
    }

    return 'ok';
  },

  async filemanagerRelateFilesContentType(
    _root,
    { contentType, contentTypeId, fileIds },
    { models }: IContext
  ) {
    const prevRelation = await models.Relations.findOne({
      contentType,
      contentTypeId
    });

    if (prevRelation) {
      await models.Relations.update(
        { _id: prevRelation._id },
        { $set: { fileIds } }
      );
    } else {
      await models.Relations.relate({ contentType, contentTypeId, fileIds });
    }

    return 'ok';
  }
};

checkPermission(mutations, 'filemanagerFolderSave', 'filemanagerFolderSave');
checkPermission(mutations, 'filemanagerFileCreate', 'filemanagerFileCreate');

export default mutations;
