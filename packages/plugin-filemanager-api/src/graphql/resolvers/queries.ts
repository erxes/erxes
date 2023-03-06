// import { checkPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const queries = {
  filemanagerFolders(
    _root,
    { limit, parentId }: { limit: number; parentId: string },
    { models }: IContext
  ) {
    const selector: any = {};
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

  filemanagerFiles(
    _root,
    { folderId, search }: { folderId: string; search?: string },
    { models }: IContext
  ) {
    const selector: any = { folderId };

    if (search) {
      selector.$or = [
        { name: { $regex: `.*${search.trim()}.*`, $options: 'i' } }
      ];
    }

    return models.Files.find(selector).sort({ createdAt: -1 });
  }
};

// checkPermission(queries, 'filemanagerFolders', 'manageFilemanager', []);
// checkPermission(queries, 'filemanagerFiles', 'manageFilemanager');

export default queries;
