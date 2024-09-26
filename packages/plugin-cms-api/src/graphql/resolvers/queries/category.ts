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
    const { searchValue, status, page = 1, perPage = 20 } = args;

    const query = {
      ...(status && { status }),
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    return paginate(models.Categories.find(query), { page, perPage });
  },

  /**
   * Cms category
   */
  async cmsCategory(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { id } = args;

    return models.Categories.findById(id);
  },
};

requireLogin(queries, 'cmsCategories');
checkPermission(queries, 'cmsCategories', 'showCmsCategories', []);

export default queries;
