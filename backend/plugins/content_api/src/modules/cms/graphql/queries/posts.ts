import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { getQueryBuilder } from '@/cms/utils/query-builders';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class PostQueryResolver extends BaseQueryResolver {
  /**
   * Cms posts
   */
  async cmsPosts(_parent: any, args: any, context: IContext): Promise<any> {
    const { language, clientPortalId } = args;
    const { models } = context;

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list } = await this.getListWithTranslations(
      models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST,
    );

    return list;
  }

  /**
   * Cms post
   */

  async cmsPost(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id, slug, language, clientPortalId } = args;

    if (!_id && !slug) return null;

    const query = slug ? { slug, clientPortalId } : { _id };

    // clientPortalId must be passed explicitly — admin queries have no
    // clientPortal in context, so the base resolver cannot fall back to it.
    return this.getItemWithTranslation(
      models.Posts,
      query,
      language,
      FIELD_MAPPINGS.POST,
      clientPortalId,
    );
  }

  /**
   * Cms post list
   */
  async cmsPostList(_parent: any, args: any, context: IContext): Promise<any> {
    const { language, clientPortalId } = args;
    const { models } = context;

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    const { dateField, dateFrom, dateTo } = args;
    if (dateField && (dateFrom || dateTo)) {
      if (['createdAt', 'updatedAt', 'scheduledDate'].includes(dateField)) {
        const existing =
          query[dateField] && typeof query[dateField] === 'object'
            ? query[dateField]
            : {};
        query[dateField] = {
          ...existing,
          ...(dateFrom ? { $gte: dateFrom } : {}),
          ...(dateTo ? { $lte: dateTo } : {}),
        };
      }
    }

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST,
    );

    return { posts: list, totalCount, pageInfo };
  }


  async cmsTranslations(_parent: any, args: any, context: IContext): Promise<any> {
    const { postId, type = 'post' } = args;
    const { models } = context;
    return models.Translations.find({ postId, type });
  }

  async cpPosts(_parent: any, args: any, context: IContext): Promise<any> {
    const { language, webId } = args;
    const { models, clientPortal } = context;
    const clientPortalId = clientPortal._id;

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    if (webId) (query as any).webId = webId;

    const { list } = await this.getListWithTranslations(
      models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST,
    );

    return list;
  }

  async cpPostList(_parent: any, args: any, context: IContext): Promise<any> {
    const { language, webId } = args;
    const { models, clientPortal } = context;
    const clientPortalId = clientPortal._id;

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    if (webId) (query as any).webId = webId;

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST,
    );

    return { posts: list, totalCount, pageInfo };
  }

  async cpPostListWithPagination(_parent: any, args: any, context: IContext): Promise<any> {
    const { language } = args;
    const { models, clientPortal } = context;
    const clientPortalId = clientPortal._id;

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    const list = await this.getListWithDefaultPagination(
      models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST,
    );

    const totalCount = await models.Posts.countDocuments(query);

    return { posts: list, totalCount };
  }

  async cpPost(_parent: any, args: any, context: IContext): Promise<any> {
    const { clientPortal, models } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) return null;

    const query = slug ? { slug, clientPortalId: clientPortal._id } : { _id };

    return this.getItemWithTranslation(
      models.Posts,
      query,
      language,
      FIELD_MAPPINGS.POST,
      clientPortal._id,
    );
  }
}

export const postQueries: Record<string, Resolver> = {
  cmsPosts: (_parent: any, args: any, context: IContext) => {
    return new PostQueryResolver(context).cmsPosts(_parent, args, context);
  },
  async cmsPost(_parent: any, args: any, context: IContext): Promise<any> {
    return new PostQueryResolver(context).cmsPost(_parent, args, context);
  },
  async cmsPostList(_parent: any, args: any, context: IContext): Promise<any> {
    return new PostQueryResolver(context).cmsPostList(_parent, args, context);
  },
  cmsTranslations: (_parent: any, args: any, context: IContext) => {
    return new PostQueryResolver(context).cmsTranslations(
      _parent,
      args,
      context,
    );
  },

  cpPosts: (_parent: any, args: any, context: IContext) => {
    return new PostQueryResolver(context).cpPosts(_parent, args, context);
  },

  cpPostList: (_parent: any, args: any, context: IContext) => {
    return new PostQueryResolver(context).cpPostList(_parent, args, context);
  },

  cpPost: (_parent: any, args: any, context: IContext) => {
    return new PostQueryResolver(context).cpPost(_parent, args, context);
  },
  cpPostListWithPagination: (_parent: any, args: any, context: IContext) => {
    return new PostQueryResolver(context).cpPostListWithPagination(
      _parent,
      args,
      context,
    );
  },
};

postQueries.cpPosts.wrapperConfig = {
  forClientPortal: true,
};

postQueries.cpPostList.wrapperConfig = {
  forClientPortal: true,
};

postQueries.cpPost.wrapperConfig = {
  forClientPortal: true,
};

postQueries.cpPostListWithPagination.wrapperConfig = {
  forClientPortal: true,
};


