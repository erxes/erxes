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

    if (!_id && !slug) {
      return null;
    }

    let query: any = {};
    if (slug) {
      query = { slug, clientPortalId };
    } else if (_id) {
      query = { _id };
    }

    return this.getItemWithTranslation(
      models.Posts,
      query,
      language,
      FIELD_MAPPINGS.POST,
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

    const orderBy = {
      [args.sortField]: args.sortDirection,
    };

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.Posts,
      query,
      { ...args, clientPortalId, language, orderBy },
      FIELD_MAPPINGS.POST,
    );

    return { posts: list, totalCount, pageInfo };
  }

  async cmsTranslations(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { postId } = args;
    const { models } = context;
    return models.Translations.find({ postId });
  }

  async cpPosts(_parent: any, args: any, context: IContext): Promise<any> {
    const { language } = args;
    const { models, clientPortal } = context;
    const clientPortalId = clientPortal._id;

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

  async cpPostList(_parent: any, args: any, context: IContext): Promise<any> {
    const { language } = args;
    const { models, clientPortal } = context;
    const clientPortalId = clientPortal._id;

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST,
    );

    return { posts: list, totalCount, pageInfo };
  }

  async cpPost(_parent: any, args: any, context: IContext): Promise<any> {
    const { clientPortal, models } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) {
      return null;
    }

    let query: any = {};
    if (slug) {
      query = { slug, clientPortalId: clientPortal._id };
    } else if (_id) {
      query = { _id };
    }

    return this.getItemWithTranslation(
      models.Posts,
      query,
      language,
      FIELD_MAPPINGS.POST,
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
