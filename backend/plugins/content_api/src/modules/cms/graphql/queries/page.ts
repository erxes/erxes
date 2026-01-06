import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { getQueryBuilder } from '@/cms/utils/query-builders';
import { Resolver } from 'erxes-api-shared/core-types';

class PageQueryResolver extends BaseQueryResolver {
  async cmsPages(_parent: any, args: any, context: IContext) {
    const { language, clientPortalId } = args;
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
      FIELD_MAPPINGS.PAGE,
    );

    return list;
  }

  async cmsPageList(_parent: any, args: any, context: IContext) {
    const { language, clientPortalId } = args;
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
      FIELD_MAPPINGS.PAGE,
    );

    return { pages: list, totalCount, pageInfo };
  }

  async cmsPage(_parent: any, args: any, context: IContext) {
    const { models } = context;
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
      models.Pages,
      query,
      language,
      FIELD_MAPPINGS.PAGE,
    );
  }

  async cpPages(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { language } = args;

    const query: any = {
      clientPortalId: clientPortal._id,
      isActive: true,
    };

    const { list } = await this.getListWithTranslations(
      models.Pages,
      query,
      { ...args, clientPortalId: clientPortal._id, language },
      FIELD_MAPPINGS.PAGE,
    );

    return list;
  }
}

const queries: Record<string, Resolver> = {
  cmsPages: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPages(_parent, args, context),
  cmsPageList: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPageList(_parent, args, context),
  cmsPage: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPage(_parent, args, context),
  cpPages: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cpPages(_parent, args, context),
};

queries.cpPages.wrapperConfig = {
  forClientPortal: true,
};

export default queries;
