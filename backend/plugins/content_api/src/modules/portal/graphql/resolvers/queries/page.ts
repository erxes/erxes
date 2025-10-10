import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/portal/utils/base-resolvers';
import { getQueryBuilder } from '@/portal/utils/query-builders';

class PageQueryResolver extends BaseQueryResolver {
  async cmsPages(_parent: any, args: any, context: IContext) {
    const { language } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const queryBuilder = getQueryBuilder('page', this.models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list } = await this.getListWithTranslations(
      this.models.Pages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE
    );

    return list;
  }

  async cmsPageList(_parent: any, args: any, context: IContext) {
    const { language } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const queryBuilder = getQueryBuilder('page', this.models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    return this.getListWithTranslations(
      this.models.Pages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE
    );
  }

  async cmsPage(_parent: any, args: any, context: IContext) {
    const { clientPortalId } = context;
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
      this.models.Pages,
      query,
      language,
      FIELD_MAPPINGS.PAGE
    );
  }
}

const resolver = new PageQueryResolver({} as IContext);
const queries = {
  cmsPages: resolver.cmsPages.bind(resolver),
  cmsPageList: resolver.cmsPageList.bind(resolver),
  cmsPage: resolver.cmsPage.bind(resolver),
};

export default queries;
