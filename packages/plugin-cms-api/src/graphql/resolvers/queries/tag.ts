import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  /**
   * Cms tags list
   */
  async cmsTags(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const {
      searchValue,
      status,
      page = 1,
      perPage = 20,
      sortField = 'name',
      sortDirection = 'asc',
    } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
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
      models.PostTags.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );
  },

  /**
   * Cms tag
   */
  async cmsTag(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id, slug } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    if (!_id && !slug) {
      return null;
    }

    if (slug) {
      return models.PostTags.findOne({ slug, clientPortalId });
    }

    return models.PostTags.findOne({ _id });
  },
};

export default queries;
