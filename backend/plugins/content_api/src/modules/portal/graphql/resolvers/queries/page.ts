import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/portal/utils/base-resolvers';
import { getQueryBuilder } from '@/portal/utils/query-builders';

class PageQueryResolver extends BaseQueryResolver {
  async cmsPages(_parent: any, args: any, context: IContext) {
    const { language } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    const { models } = context;
    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const queryBuilder = getQueryBuilder('page', models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list } = await this.getListWithTranslations(
      models.Pages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE
    );

    return list;
  }

  async cmsPageList(_parent: any, args: any, context: IContext) {
    const { language } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    const { models } = context; 
    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const queryBuilder = getQueryBuilder('page', models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.Pages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE
    );

    return { pages: list, totalCount, pageInfo };
  }

  async cmsPage(_parent: any, args: any, context: IContext) {
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
      models.Pages,
      query,
      language,
      FIELD_MAPPINGS.PAGE
    );
  }
}

const queries = {
  cmsPages: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPages(_parent, args, context),
  cmsPageList: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPageList(_parent, args, context),
  cmsPage: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPage(_parent, args, context),
};

export default queries;
