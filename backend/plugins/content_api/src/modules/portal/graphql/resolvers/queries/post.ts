import { BaseQueryResolver, FIELD_MAPPINGS } from '@/portal/utils/base-resolvers';
import { getQueryBuilder } from '@/portal/utils/query-builders';
import { IContext } from '~/connectionResolvers';

class PostQueryResolver extends BaseQueryResolver {
  /**
   * Cms posts
   */
  async cmsPosts(_parent: any, args: any, context: IContext): Promise<any> {
    const { language } = args;
    const { models } = context;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    
    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list } = await this.getListWithTranslations(
      models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST
    );

    return list;
  }

  /**
   * Cms post
   */
  async cmsPost(_parent: any, args: any, context: IContext): Promise<any> {
    const { clientPortalId, models } = context;
    const { _id, slug, language } = args;

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
      FIELD_MAPPINGS.POST
    );
  }

  /**
   * Cms post list
   */
  async cmsPostList(_parent: any, args: any, context: IContext): Promise<any> {
    const { language } = args;
    const { models } = context;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    
    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST
    );

    return { posts: list, totalCount, pageInfo };
  }

  async cmsTranslations(_parent: any, args: any, context: IContext): Promise<any> {
    const { postId } = args;
    const { models } = context;
    return models.Translations.find({ postId });
  }
}

const queries = {
  cmsPosts: (_parent: any, args: any, context: IContext) =>
    new PostQueryResolver(context).cmsPosts(_parent, args, context),
  cmsPost: (_parent: any, args: any, context: IContext) =>
    new PostQueryResolver(context).cmsPost(_parent, args, context),
  cmsPostList: (_parent: any, args: any, context: IContext) =>
    new PostQueryResolver(context).cmsPostList(_parent, args, context),
  cmsTranslations: (_parent: any, args: any, context: IContext) =>
    new PostQueryResolver(context).cmsTranslations(_parent, args, context),
};

export default queries;
