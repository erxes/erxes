import { checkPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const queries = {
  async filemanagerFolders(
    _root,
    { limit, parentId }: { limit: number; parentId: string },
    { models, subdomain, user }: IContext
  ) {
    const units = await sendCoreMessage({
      subdomain,
      action: 'units.find',
      data: {
        userIds: { $in: user._id }
      },
      isRPC: true
    });

    const permissionSelector = [
      { permissionUserIds: { $in: [user._id] } },
      { permissionUnitId: { $in: units.map(u => u._id) } }
    ];

    const filesWithAccess = await models.Files.find(
      { $or: permissionSelector },
      { folderId: 1 }
    );

    const selector: any = {
      parentId: '',
      $or: [
        { createdUserId: user._id },
        ...permissionSelector,
        { _id: filesWithAccess.map(file => file.folderId) }
      ]
    };

    const sort = { createdAt: -1 };

    if (parentId) {
      selector.parentId = parentId;
    }

    if (limit) {
      return models.Folders.find(selector)
        .sort(sort)
        .limit(limit);
    }

    return paginate(models.Folders.find(selector), {}).sort(sort);
  },

  async filemanagerFolderDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Folders.findOne({ _id });
  },

  async filemanagerFiles(
    _root,
    { folderId, search }: { folderId: string; search?: string },
    { models, subdomain, user }: IContext
  ) {
    const units = await sendCoreMessage({
      subdomain,
      action: 'units.find',
      data: {
        userIds: { $in: user._id }
      },
      isRPC: true
    });

    const unitIds = units.map(u => u._id);

    const selector: any = {
      folderId
    };

    if (search) {
      selector.name = { $regex: `.*${search.trim()}.*`, $options: 'i' };
    }

    const folder = await models.Folders.getFolder({ _id: folderId });

    if (
      !(
        unitIds.includes(folder.permissionUnitId) ||
        (folder.permissionUserIds || []).includes(user._id)
      )
    ) {
      selector.$or = [
        { createdUserId: user._id },
        { permissionUserIds: { $in: [user._id] } },
        { permissionUnitId: { $in: units.map(u => u._id) } }
      ];
    }

    return models.Files.find(selector).sort({ createdAt: -1 });
  },

  async filemanagerFileDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Files.findOne({ _id });
  },

  async filemanagerLogs(
    _root,
    { contentTypeId }: { contentTypeId: string },
    { models }: IContext
  ) {
    return models.Logs.find({ contentTypeId }).sort({ createdAt: -1 });
  },

  async filemanagerGetAckRequest(
    _root,
    { fileId }: { fileId: string },
    { models, user }: IContext
  ) {
    return models.Requests.findOne({ fileId, toUserId: user._id });
  }
};

checkPermission(queries, 'filemanagerFolders', 'showFilemanager', []);
checkPermission(queries, 'filemanagerFiles', 'showFilemanager');

export default queries;
