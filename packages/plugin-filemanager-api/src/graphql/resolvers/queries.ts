import { checkPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { checkFilePermission } from '../../utils';

const queries = {
  async filemanagerFolders(
    _root,
    {
      limit,
      parentId,
      isTree
    }: { limit: number; parentId: string; isTree: boolean },
    { models }: IContext
  ) {
    if (isTree) {
      return models.Folders.find({}).sort({ order: 1 });
    }

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
    const file = await models.Files.getFile({ _id });

    return checkFilePermission({ file, models, subdomain, user });
  },

  async filemanagerLogs(
    _root,
    { contentTypeId }: { contentTypeId: string },
    { models }: IContext
  ) {
    return models.Logs.find({ contentTypeId }).sort({ createdAt: -1 });
  },

  async filemanagerGetAckRequestByUser(
    _root,
    { fileId }: { fileId: string },
    { models, user }: IContext
  ) {
    return models.AckRequests.findOne({ fileId, toUserId: user._id });
  },

  async filemanagerGetAckRequests(
    _root,
    { fileId }: { fileId: string },
    { models, user }: IContext
  ) {
    return models.AckRequests.find({ fileId });
  },

  async filemanagerGetAccessRequests(
    _root,
    { fileId }: { fileId: string },
    { models, user }: IContext
  ) {
    const file = await models.Files.getFile({ _id: fileId });

    if (file.createdUserId !== user._id) {
      return [];
    }

    return models.AccessRequests.find({ fileId });
  },

  async filemanagerGetRelatedFilesContentType(
    _root,
    {
      contentType,
      contentTypeId
    }: { contentType: string; contentTypeId: string },
    { models }: IContext
  ) {
    return models.Relations.find({ contentType, contentTypeId });
  }
};

checkPermission(queries, 'filemanagerFolders', 'showFilemanager', []);
checkPermission(queries, 'filemanagerFiles', 'showFilemanager');

export default queries;
