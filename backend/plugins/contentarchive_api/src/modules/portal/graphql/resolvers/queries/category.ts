import { IContext } from '~/connectionResolvers';
import {
  BaseQueryResolver,
  FIELD_MAPPINGS,
} from '@/portal/utils/base-resolvers';
import { getQueryBuilder } from '@/portal/utils/query-builders';
import { Resolver } from 'erxes-api-shared/core-types';

class CategoryQueryResolver extends BaseQueryResolver {
  /**
   * Cms categories list
   */
  async cmsCategories(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { language, clientPortalId } = args;
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
    const {  models } = context;
    const { _id, slug, language, clientPortalId } = args;

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

  async cpCategories(_parent: any, args: any, context: IContext): Promise<any> {
    const { models, clientPortal } = context;
    const { language } = args;

    const query: any = {
      clientPortalId: clientPortal._id,
      status: 'active',
    };

    const { list } = await this.getListWithTranslations(
      models.Categories,
      query,
      { ...args, clientPortalId: clientPortal._id, language },
      FIELD_MAPPINGS.CATEGORY,
    );

    return list;
  }
}

const resolver = new CategoryQueryResolver({} as IContext);
const queries: Record<string, Resolver> = {
  cmsCategories: resolver.cmsCategories.bind(resolver),
  cmsCategory: resolver.cmsCategory.bind(resolver),
  cpCategories: resolver.cpCategories.bind(resolver),
};

queries.cpCategories.wrapperConfig = {
  forClientPortal: true,
};

export default queries;
