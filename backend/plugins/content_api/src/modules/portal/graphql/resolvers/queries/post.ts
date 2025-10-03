import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';

export const queryBuilder = async (args: any, models: IModels) => {
  const query: any = {
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
    const { models } = context;
    const {
      language,
    } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query = await queryBuilder({ ...args, clientPortalId }, models);

    const { list } = await cursorPaginate({
      model: models.Posts,
      params: args,
      query,
    });

    if (!language) {
      return list;
    }

    const config = await models.Portals.findOne({ _id: clientPortalId }).lean();

    if (!config) {
      return list;
    }

    if (config.language === language) {
      return list;
    }

    const postIds = list.map((post) => post._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: postIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    const postsWithTranslations = list.map((post) => {
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
    const { models, clientPortalId } = context;
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

    const config = await models.Portals.findOne({ _id: clientPortalId }).lean();

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
    const { models } = context;
    const {
      page = 1,
      perPage = 20,
      language,
    } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query = await queryBuilder({ ...args, clientPortalId }, models);

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Posts,
      params: args,
      query,
    });

    const totalPages = Math.ceil(totalCount / perPage);
    const response = { list, totalCount, pageInfo };
    if (!language) {
      return response;
    }


    const config = await models.Portals.findOne({ _id: clientPortalId }).lean();

    if (!config) {
      return response;
    }

    if (config.language === language) {
      return response;
    }

    const postIds = list.map((post) => post._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: postIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    const postsWithTranslations = list.map((post) => {
      const translation = translationsMap[post._id.toString()];
      post.title = translation?.title || post.title;
      post.excerpt = translation?.excerpt || post.excerpt;
      post.content = translation?.content || post.content;
      post.customFieldsData = translation?.customFieldsData || post.customFieldsData;

      return post;
    });

    return {
      list: postsWithTranslations.map((post) => post),
      totalCount,
      pageInfo,
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
