// import { checkPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const permissionSelector = async ({ subdomain, user }) => {
  const units = await sendCoreMessage({
    subdomain,
    action: 'units.find',
    data: {
      userIds: { $in: user._id }
    },
    isRPC: true
  });

  return [
    { createdUserId: user._id },
    { 'permissionConfig.userIds': { $in: [user._id] } },
    { 'permissionConfig.unitId': { $in: units.map(u => u._id) } }
  ];
};

const queries = {
  async filemanagerFolders(
    _root,
    { limit, parentId }: { limit: number; parentId: string },
    { models, subdomain, user }: IContext
  ) {
    const selector: any = {
      parentId: '',
      $or: await permissionSelector({ subdomain, user })
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

  async filemanagerFiles(
    _root,
    { folderId, search }: { folderId: string; search?: string },
    { models, subdomain, user }: IContext
  ) {
    const selector: any = {
      folderId,
      $or: await permissionSelector({ subdomain, user })
    };

    if (search) {
      selector.name = { $regex: `.*${search.trim()}.*`, $options: 'i' };
    }

    return models.Files.find(selector).sort({ createdAt: -1 });
  },

  async filemanagerLogs(
    _root,
    { contentTypeId }: { contentTypeId: string },
    { models }: IContext
  ) {
    return models.Logs.find({ contentTypeId }).sort({ createdAt: -1 });
  }
};

// checkPermission(queries, 'filemanagerFolders', 'manageFilemanager', []);
// checkPermission(queries, 'filemanagerFiles', 'manageFilemanager');

export default queries;
