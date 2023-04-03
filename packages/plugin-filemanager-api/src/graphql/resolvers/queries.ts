import { checkPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const queries = {
  async filemanagerFolders(
    _root,
    { limit, parentId }: { limit: number; parentId: string },
    { models }: IContext
  ) {
    const selector: any = {
      parentId: ''
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
    {
      folderId,
      search,
      type,
      contentType,
      contentTypeId,
      createdAtFrom,
      createdAtTo,
      sortField,
      sortDirection
    }: {
      folderId: string;
      search?: string;
      type?: string;
      contentType?: string;
      contentTypeId?: string;
      createdAtFrom?: string;
      createdAtTo?: string;
      sortField?: string;
      sortDirection?: number;
    },

    { models }: IContext
  ) {
    const selector: any = {
      folderId
    };

    if (search) {
      selector.name = { $regex: `.*${search.trim()}.*`, $options: 'i' };
    }

    if (type) {
      selector.type = type;
    }

    if (contentType) {
      selector.contentType = contentType;
    }

    if (contentTypeId) {
      selector.contentTypeId = contentTypeId;
    }

    if (createdAtFrom || createdAtTo) {
      selector.createdAt = {};

      if (createdAtFrom) {
        selector.createdAt.$gte = new Date(createdAtFrom);
      }

      if (createdAtTo) {
        selector.createdAt.$lte = new Date(createdAtTo);
      }
    }

    return models.Files.find(selector).sort({
      [sortField ? sortField : 'createdAt']: sortDirection || -1
    });
  },

  async filemanagerFileDetail(
    _root,
    { _id }: { _id: string },
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

    const file = await models.Files.getFile({ _id });
    const folder = await models.Folders.getFolder({ _id: file.folderId });

    if (
      unitIds.includes(folder.permissionUnitId) ||
      (folder.permissionUserIds || []).includes(user._id)
    ) {
      return file;
    }

    if (
      file.createdUserId === user._id ||
      (file.permissionUserIds || []).includes(user._id) ||
      units.map(u => u._id).includes(file.permissionUnitId || [])
    ) {
      return file;
    }

    throw new Error('Permission denied');
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
