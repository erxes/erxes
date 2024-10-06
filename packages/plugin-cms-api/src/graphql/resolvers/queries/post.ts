import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const queryBuilder = (args: any) => {
  let query: any = {
    clientPortalId: args.clientPortalId,
  };

  if (args.status) {
    query.status = args.status;
  }

  if (args.searchValue) {
    query.$or = [
      { title: { $regex: args.searchValue, $options: 'i' } },
      { slug: { $regex: args.searchValue, $options: 'i' } },
      { content: { $regex: args.searchValue, $options: 'i' } },
      { excerpt: { $regex: args.searchValue, $options: 'i' } },
    ];
  }

  return query;
};

const queries = {
  /**
   * Cms posts
   */
  cmsPosts: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const {
      page = 1,
      perPage = 20,
      sortField = 'publishedDate',
      sortDirection = 'asc',
    } = args;

    const query = queryBuilder(args);

    return paginate(
      models.Posts.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );
  },

  /**
   * Cms post
   */
  cmsPost: async (_parent: any, args: any, context: IContext): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.Posts.findById(_id);
  },

  /**
   * Cms post list
   */
  cmsPostList: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const {
      page = 1,
      perPage = 20,
      sortField = 'publishedDate',
      sortDirection = 'desc',
    } = args;

    const query = queryBuilder(args);

    const totalCount = await models.Posts.find(query).countDocuments();

    const posts = await paginate(
      models.Posts.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    const totalPages = Math.ceil(totalCount / perPage);

    return { totalCount, totalPages, currentPage: page, posts };
  },
};

export default queries;
