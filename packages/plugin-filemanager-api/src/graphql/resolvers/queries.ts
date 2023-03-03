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
    { folderId }: { folderId: string },
    { models }: IContext
  ) {
    return models.Files.find({ folderId }).sort({ createdAt: -1 });
  }
};

// checkPermission(queries, 'filemanagerFolders', 'manageFilemanager', []);
// checkPermission(queries, 'filemanagerFiles', 'manageFilemanager');

export default queries;
