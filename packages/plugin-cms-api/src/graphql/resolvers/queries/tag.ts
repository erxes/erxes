import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const queries = {
  /**
   * Cms tags list
   */
  async cmsTags(
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

    return paginate(models.PostTags.find(query).sort({ [sortField]: sortDirection }), { page, perPage });
  },

  /**
   * Cms tag
   */
  async cmsTag(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id } = args;

    return models.PostTags.findOne({ $or: [{ _id }, { slug: _id }] });
  },
};

requireLogin(queries, 'cmsTags');
requireLogin(queries, 'cmsTag');
checkPermission(queries, 'cmsTags', 'showCmsTags', []);
checkPermission(queries, 'cmsTag', 'showCmsTags', []);

export default queries;
