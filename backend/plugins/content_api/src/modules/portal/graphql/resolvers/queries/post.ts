import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/portal/utils/base-resolvers';
import { getQueryBuilder } from '@/portal/utils/query-builders';
import { getTranslationService } from '@/portal/utils/translation-utils';

class PostQueryResolver extends BaseQueryResolver {
  /**
   * Cms posts
   */
  async cmsPosts(_parent: any, args: any, context: IContext): Promise<any> {
    const { language } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    
    const queryBuilder = getQueryBuilder('post', this.models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list } = await this.getListWithTranslations(
      this.models.Posts,
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
    const { clientPortalId } = context;
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
      this.models.Posts,
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
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    
    const queryBuilder = getQueryBuilder('post', this.models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId });

    return this.getListWithTranslations(
      this.models.Posts,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.POST
    );
  }

  async cmsTranslations(_parent: any, args: any, context: IContext): Promise<any> {
    const { postId } = args;
    return this.models.Translations.find({ postId });
  }
}

const resolver = new PostQueryResolver({} as IContext);
const queries = {
  cmsPosts: resolver.cmsPosts.bind(resolver),
  cmsPost: resolver.cmsPost.bind(resolver),
  cmsPostList: resolver.cmsPostList.bind(resolver),
  cmsTranslations: resolver.cmsTranslations.bind(resolver),
};

export default queries;
