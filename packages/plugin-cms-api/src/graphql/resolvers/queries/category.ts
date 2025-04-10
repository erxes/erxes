import { paginate } from '@erxes/api-utils/src';

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
    const {
      searchValue,
      status,
      page = 1,
      perPage = 20,
      sortField = 'name',
      sortDirection = 'asc',
    } = args;
    const clientPortalId = args.clientPortalId || context.clientPortalId;
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

    return paginate(
      models.Categories.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );
  },

  /**
   * Cms category
   */
  async cmsCategory(_parent: any, args: any, context: IContext): Promise<any> {
    const { models, clientPortalId } = context;
    const { _id, slug } = args;

    if (!_id && !slug) {
      return null;
    }

    if (slug) {
      return models.Categories.findOne({ slug, clientPortalId });
    }

    return models.Categories.findOne({ _id });
  },
};

export default queries;
