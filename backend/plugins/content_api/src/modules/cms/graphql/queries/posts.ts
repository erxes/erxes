import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import {
  CMS_DEFAULT_POST_URL_FIELD,
  CMS_POST_URL_FIELDS,
  CMSPostUrlField,
} from '@/cms/@types/cms';
import { POST_VIEW_RETENTION_DAYS } from '@/cms/db/models/PostViews';
import { getQueryBuilder } from '@/cms/utils/query-builders';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class PostQueryResolver extends BaseQueryResolver {
  private async findMostViewedPosts(
    args: {
      clientPortalId: string;
      days: number;
      limit?: number;
      language?: string;
      webId?: string;
      publishedOnly?: boolean;
      type?: string;
    },
    models: IContext['models'],
  ) {
    const { clientPortalId, days, language, webId, publishedOnly, type } = args;

    if (!Number.isInteger(days) || days <= 0) {
      throw new Error('days must be a positive integer');
    }

    const effectiveDays = Math.min(days, POST_VIEW_RETENTION_DAYS);

    const recentViewCounts = await models.PostViews.getRecentViewCounts(
      clientPortalId,
      new Date(Date.now() - (effectiveDays - 1) * 24 * 60 * 60 * 1000),
    );

    if (!recentViewCounts.length) {
      return [];
    }

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({
      clientPortalId,
      type,
      ...(publishedOnly ? { status: 'published' } : {}),
    });
    query._id = { $in: recentViewCounts.map((item) => item.postId) };

    if (webId) {
      query.webId = webId;
    }

    const limit = Math.min(Math.max(args.limit || 10, 1), 100);
    const posts = await models.Posts.find(query).lean();
    const postMap = new Map(
      posts.map((post: any) => [post._id.toString(), post]),
    );

    const list = recentViewCounts
      .map(({ postId, recentViewCount }) => {
        const post = postMap.get(postId);

        if (!post) {
          return null;
        }

        return {
          ...post,
          recentViewCount,
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    if (!language) {
      return list;
    }

    const shouldSkip = await this.shouldSkipTranslation(
      clientPortalId,
      language,
    );

    if (shouldSkip || !list.length) {
      return list;
    }

    const translations = await this.getTranslations(
      list.map((item: any) => item._id.toString()),
      language,
      'post',
    );

    return this.applyTranslationsToList(
      list,
      translations,
      FIELD_MAPPINGS.POST,
    );
  }

  private async getPostUrlField(
    clientPortalId: string,
    models: IContext['models'],
  ): Promise<CMSPostUrlField> {
    const cms = await models.CMS.findOne({ clientPortalId })
      .select({ postUrlField: 1 })
      .lean();

    if (
      cms?.postUrlField &&
      CMS_POST_URL_FIELDS.includes(cms.postUrlField as CMSPostUrlField)
    ) {
      return cms.postUrlField as CMSPostUrlField;
    }

    return CMS_DEFAULT_POST_URL_FIELD;
  }

  private async buildPostLookupQuery(
    args: {
      _id?: string;
      count?: number;
      slug?: string;
      identifier?: string;
      clientPortalId?: string;
    },
    models: IContext['models'],
  ) {
    const { _id, count, slug, identifier, clientPortalId } = args;

    if (_id) {
      return clientPortalId ? { _id, clientPortalId } : { _id };
    }

    if (count !== undefined && count !== null) {
      if (!clientPortalId) {
        throw new Error('clientPortalId is required when querying by count');
      }

      return { count, clientPortalId };
    }

    if (slug) {
      if (!clientPortalId) {
        throw new Error('clientPortalId is required when querying by slug');
      }

      return { slug, clientPortalId };
    }

    if (!identifier) {
      return null;
    }

    if (!clientPortalId) {
      throw new Error(
        'clientPortalId is required when querying by configured post URL',
      );
    }

    const postUrlField = await this.getPostUrlField(clientPortalId, models);

    if (postUrlField === 'count') {
      const count = Number(identifier);

      if (Number.isNaN(count)) {
        return null;
      }

      return { count, clientPortalId };
    }

    return { [postUrlField]: identifier, clientPortalId };
  }

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
    const { _id, count, slug, identifier, language, clientPortalId } = args;

    const query = await this.buildPostLookupQuery(
      { _id, count, slug, identifier, clientPortalId },
      models,
    );

    if (!query) return null;

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
      if (
        ['createdAt', 'updatedAt', 'scheduledDate', 'publishedDate'].includes(
          dateField,
        )
      ) {
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

  async cmsTranslations(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { objectId, type = 'post' } = args;
    const { models } = context;
    return models.Translations.find({ objectId, type });
  }

  async cmsMostViewedPosts(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { models } = context;
    const { clientPortalId, days, limit, language, webId, type } = args;

    return this.findMostViewedPosts(
      { clientPortalId, days, limit, language, webId, type },
      models,
    );
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

  async cpPostListWithPagination(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
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
    const { _id, count, slug, identifier, language } = args;

    const query = await this.buildPostLookupQuery(
      { _id, count, slug, identifier, clientPortalId: clientPortal._id },
      models,
    );

    if (!query) return null;

    return this.getItemWithTranslation(
      models.Posts,
      query,
      language,
      FIELD_MAPPINGS.POST,
      clientPortal._id,
    );
  }

  async cpMostViewedPosts(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { models, clientPortal } = context;
    const { days, limit, language, webId, type } = args;

    return this.findMostViewedPosts(
      {
        clientPortalId: clientPortal._id,
        days,
        limit,
        language,
        webId,
        publishedOnly: true,
        type,
      },
      models,
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
  cmsMostViewedPosts: (_parent: any, args: any, context: IContext) => {
    return new PostQueryResolver(context).cmsMostViewedPosts(
      _parent,
      args,
      context,
    );
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
  cpMostViewedPosts: (_parent: any, args: any, context: IContext) => {
    return new PostQueryResolver(context).cpMostViewedPosts(
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

postQueries.cpMostViewedPosts.wrapperConfig = {
  forClientPortal: true,
};
