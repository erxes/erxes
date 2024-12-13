import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const queries = {
  cmsPages: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const {
      page,
      perPage,
    } = args;

    const query: any = {
      clientPortalId: args.clientPortalId,
    };


    if (page && perPage) {
      return paginate(
        models.Pages.find(query).sort({ createdAt: 1 }),
        { page, perPage }
      );
    }

    return models.Pages.find(query).sort({ createdAt: 1 });
  },

  cmsPageList: async (parent: any, args: any, {models}: IContext) => {
    const {
      page = 1,
      perPage = 20,
      sortField = 'createdAt',
      sortDirection = 'desc',
      clientPortalId
    } = args;

    const query: any = {
      clientPortalId,
    };

  
    const totalCount = await models.Pages.find(query).countDocuments();

    const pages = await paginate(
      models.Pages.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    const totalPages = Math.ceil(totalCount / perPage);

    return { totalCount, totalPages, currentPage: page, pages };
  },

  cmsPage: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { _id } = args;

    return models.Pages.findOne({ $or: [{ _id }, { slug: _id }] });
  },
};

export default queries;
