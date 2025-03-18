import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

export const queryBuilder = (args: any) => {
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

    const query = queryBuilder({ ...args, clientPortalId });

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

    const query = queryBuilder({ ...args, clientPortalId });

    const totalCount = await models.Posts.find(query).countDocuments();

    const posts = await paginate(
      models.Posts.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    const totalPages = Math.ceil(totalCount / perPage);

    return { totalCount, totalPages, currentPage: page, posts };
  },

  cmsCustomPostTypeList: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { page = 1, perPage = 20, searchValue } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const totalCount =
      await models.CustomPostTypes.find(query).countDocuments();

    const list = await paginate(models.CustomPostTypes.find(query), {
      page,
      perPage,
    });

    const totalPages = Math.ceil(totalCount / perPage);

    return { totalCount, totalPages, currentPage: page, list };
  },

  cmsCustomPostTypes: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { page = 1, perPage = 20, searchValue } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    return paginate(models.CustomPostTypes.find(query), {
      page,
      perPage,
    });
  },

  cmsPostType: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.CustomPostTypes.findOne({ _id });
  },
};

requireLogin(queries, 'cmsPosts');
requireLogin(queries, 'cmsPost');
requireLogin(queries, 'cmsPostList');
checkPermission(queries, 'cmsPosts', 'showCmsPosts', []);
checkPermission(queries, 'cmsPost', 'showCmsPosts', []);
checkPermission(queries, 'cmsPostList', 'showCmsPosts', []);

export default queries;
