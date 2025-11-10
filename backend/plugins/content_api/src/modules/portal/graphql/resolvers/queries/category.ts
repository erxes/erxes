import { IContext } from '~/connectionResolvers';
import {
  BaseQueryResolver,
  FIELD_MAPPINGS,
} from '@/portal/utils/base-resolvers';
import { getQueryBuilder } from '@/portal/utils/query-builders';

class CategoryQueryResolver extends BaseQueryResolver {
  /**
   * Cms categories list
   */
  async cmsCategories(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { language } = args;
    const clientPortalId = args.clientPortalId || context.clientPortalId;
    const { models } = context;
    const queryBuilder = getQueryBuilder('category', models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    return this.getListWithTranslations(
      models.Categories,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.CATEGORY,
    );
  }

  /**
   * Cms category
   */
  async cmsCategory(_parent: any, args: any, context: IContext): Promise<any> {
    const { clientPortalId, models } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) {
      return null;
    }

    let query: any = {};
    if (slug) {
      query = { slug, clientPortalId };
    } else {
      query = { _id };
    }

    return this.getItemWithTranslation(
      models.Categories,
      query,
      language,
      FIELD_MAPPINGS.CATEGORY,
    );
  }
}

const resolver = new CategoryQueryResolver({} as IContext);
const queries = {
  cmsCategories: resolver.cmsCategories.bind(resolver),
  cmsCategory: resolver.cmsCategory.bind(resolver),
};

export default queries;
