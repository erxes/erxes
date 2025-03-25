import { paginate } from '@erxes/api-utils/src';

import { IContext, IModels } from '../../../connectionResolver';

export const queryBuilder = async (args: any, models: IModels) => {

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

  if (args.categoryIds) {
    query.categoryIds = { $in: args.categoryIds };
  }

  if (args.tagIds) {
    query.tagIds = { $in: args.tagIds };
  }

  if (args.authorId) {
    query.authorId = args.authorId;
  }

  if (args.featured) {
    query.featured = args.featured;
  }

  if (args.type === 'post') {
    query.type = 'post';
  }

  if (args.type && args.type !== 'post') {
    const type = await models.CustomPostTypes.findOne({
      clientPortalId: args.clientPortalId,
      code: args.type,
    }).lean()

    if (type) {
      query.type = type._id;
    }
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
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query =  await queryBuilder({ ...args, clientPortalId }, models);

    return paginate(
      models.Posts.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );
  },

  /**
   * Cms post
   */
  cmsPost: async (_parent: any, args: any, context: IContext): Promise<any> => {
    const { models, clientPortalId } = context;
    const { _id, slug } = args;

    if (!_id && !slug) {
      return null;
    }

    if (slug) {
      return models.Posts.findOne({ slug, clientPortalId });
    }

    const post = await models.Posts.findOne({
      _id,
    });

    return post;
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
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query = await queryBuilder({ ...args, clientPortalId }, models);

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
