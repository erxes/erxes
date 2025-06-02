import { paginate } from '@erxes/api-utils/src';

import { IContext, IModels } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

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
    }).lean();

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
    const { models, subdomain } = context;
    const {
      page = 1,
      perPage = 20,
      sortField = 'publishedDate',
      sortDirection = 'asc',
      language,
    } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query = await queryBuilder({ ...args, clientPortalId }, models);

    const posts = await paginate(
      models.Posts.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    if (!language) {
      return posts;
    }

    const config = await sendCommonMessage({
      subdomain,
      serviceName: 'clientportal',
      action: 'clientPortals.findOne',
      data: { _id: clientPortalId },
      isRPC: true,
      defaultValue: null,
    });

    if (!config) {
      return posts;
    }

    if (config.language === language) {
      return posts;
    }

    const postIds = posts.map((post) => post._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: postIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    const postsWithTranslations = posts.map((post) => {
      const translation = translationsMap[post._id.toString()];
      post.title = translation?.title || post.title;
      post.excerpt = translation?.excerpt || post.excerpt;
      post.content = translation?.content || post.content;
      post.customFieldsData = translation?.customFieldsData || post.customFieldsData;

      return post;
    });

    return postsWithTranslations;
  },

  /**
   * Cms post
   */
  cmsPost: async (_parent: any, args: any, context: IContext): Promise<any> => {
    const { models, clientPortalId, subdomain } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) {
      return null;
    }

    let post: any = null;

    if (slug) {
      post = await models.Posts.findOne({ slug, clientPortalId }).lean();
    } else if (_id) {
      post = await models.Posts.findOne({
        _id,
      }).lean();
    }

    if (!post) {
      return null;
    }

    if (!language) {
      return post;
    }

    const config = await sendCommonMessage({
      subdomain,
      serviceName: 'clientportal',
      action: 'clientPortals.findOne',
      data: { _id: clientPortalId },
      isRPC: true,
      defaultValue: null,
    });

    if (!config) {
      return post;
    }

    if (config.language === language) {
      return post;
    }

    const translation = await models.PostTranslations.findOne({
      postId: post._id,
      language,
    }).lean();

    if (translation) {
      Object.assign(post, {
        ...(translation.title && { title: translation.title }),
        ...(translation.excerpt && { excerpt: translation.excerpt }),
        ...(translation.content && { content: translation.content }),
        ...(translation.customFieldsData && {
          customFieldsData: translation.customFieldsData,
        }),
      });
    }
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
    const { models, subdomain } = context;
    const {
      page = 1,
      perPage = 20,
      sortField = 'publishedDate',
      sortDirection = 'desc',
      language,
    } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query = await queryBuilder({ ...args, clientPortalId }, models);

    const totalCount = await models.Posts.find(query).countDocuments();

    const posts = await paginate(
      models.Posts.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    const totalPages = Math.ceil(totalCount / perPage);
    const response = { totalCount, totalPages, currentPage: page, posts };
    if (!language) {
      return response;
    }

    const config = await sendCommonMessage({
      subdomain,
      serviceName: 'clientportal',
      action: 'clientPortals.findOne',
      data: { _id: clientPortalId },
      isRPC: true,
      defaultValue: null,
    });

    if (!config) {
      return response;
    }

    if (config.language === language) {
      return response;
    }

    const postIds = posts.map((post) => post._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: postIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    const postsWithTranslations = posts.map((post) => {
      const translation = translationsMap[post._id.toString()];
      post.title = translation?.title || post.title;
      post.excerpt = translation?.excerpt || post.excerpt;
      post.content = translation?.content || post.content;
      post.customFieldsData = translation?.customFieldsData || post.customFieldsData;

      return post;
    });

    return {
      totalCount,
      totalPages,
      currentPage: page,
      posts: postsWithTranslations.map((post) => post),
    };
  },

  cmsPostTranslations: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { postId } = args;

    return models.PostTranslations.find({ postId });
  },
};

export default queries;
