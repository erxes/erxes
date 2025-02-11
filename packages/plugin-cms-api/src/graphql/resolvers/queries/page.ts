import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const queries = {
  cmsPages: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { page, perPage, searchValue } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    if (page && perPage) {
      return paginate(models.Pages.find(query).sort({ createdAt: 1 }), {
        page,
        perPage,
      });
    }

    return models.Pages.find(query).sort({ createdAt: 1 });
  },

  cmsPageList: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const {
      page = 1,
      perPage = 20,
      sortField = 'createdAt',
      sortDirection = 'desc',
      searchValue,
    } = args;

    const clientPortalId = context.clientPortalId || args.clientPortalId;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const totalCount = await models.Pages.find(query).countDocuments();

    const pages = await paginate(
      models.Pages.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    const totalPages = Math.ceil(totalCount / perPage);

    return { totalCount, totalPages, currentPage: page, pages };
  },

  cmsPage: async (parent: any, args: any, context: IContext) => {
    const { models, clientPortalId } = context;
    const { _id, slug } = args;

    if (!_id && !slug) {
      return null;
    }

    if (slug) {
      return models.Pages.findOne({ slug, clientPortalId });
    }

    return models.Pages.findOne({ _id });
  },
};

export default queries;
