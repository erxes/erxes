import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const queries = {
  /**
   * Cms categories list
   */
  async cmsCategories(
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> {
    const { models } = context;
    const {clientPortalId, searchValue, status, page = 1, perPage = 20, sortField = 'name', sortDirection = 'asc' } = args;

    const query = {
      clientPortalId,
      ...(status && { status }),
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    return paginate(models.Categories.find(query).sort({ [sortField]: sortDirection }), { page, perPage });
  },

  /**
   * Cms category
   */
  async cmsCategory(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id } = args;

    return models.Categories.findOne({ $or: [{ _id }, { slug: _id }] });
  },
};

requireLogin(queries, 'cmsCategories');
requireLogin(queries, 'cmsCategory');
checkPermission(queries, 'cmsCategories', 'showCmsCategories', []);
checkPermission(queries, 'cmsCategory', 'showCmsCategories', []);

export default queries;
