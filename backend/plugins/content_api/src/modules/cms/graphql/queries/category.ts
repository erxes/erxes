import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { getQueryBuilder } from '@/cms/utils/query-builders';
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
      'category',
    );
  }

  /**
   * Cms category
   */
  async cmsCategory(_parent: any, args: any, context: IContext): Promise<any> {
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
      models.Categories,
      query,
      language,
      FIELD_MAPPINGS.CATEGORY,
      clientPortalId,
      'category',
    );
  }

  async cpCategories(_parent: any, args: any, context: IContext): Promise<any> {
    const { models, clientPortal } = context;
    const { language } = args;
    const clientPortalId = args.clientPortalId || clientPortal?._id;

    const query: any = {
      clientPortalId,
      status: 'active',
    };

    return this.getListWithTranslations(
      models.Categories,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.CATEGORY,
      'category',
    );
  }

  async cpCmsCategoryDetail(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { models, clientPortal } = context;
    const { _id, slug, language } = args;
    const clientPortalId = clientPortal?._id;

    if (!_id && !slug) {
      return null;
    }

    const query = slug ? { slug, clientPortalId } : { _id, clientPortalId };

    return this.getItemWithTranslation(
      models.Categories,
      query,
      language,
      FIELD_MAPPINGS.CATEGORY,
      clientPortalId,
      'category',
    );
  }
}

export const contentCmsCategoryQueries: Record<string, Resolver> = {
  cmsCategories: (_parent: any, args: any, context: IContext) =>
    new CategoryQueryResolver(context).cmsCategories(_parent, args, context),
  cmsCategory: (_parent: any, args: any, context: IContext) =>
    new CategoryQueryResolver(context).cmsCategory(_parent, args, context),
  cpCategories: (_parent: any, args: any, context: IContext) =>
    new CategoryQueryResolver(context).cpCategories(_parent, args, context),
  cpCmsCategoryDetail: (_parent: any, args: any, context: IContext) =>
    new CategoryQueryResolver(context).cpCmsCategoryDetail(
      _parent,
      args,
      context,
    ),
};

contentCmsCategoryQueries.cpCategories.wrapperConfig = {
  forClientPortal: true,
};

contentCmsCategoryQueries.cpCmsCategoryDetail.wrapperConfig = {
  forClientPortal: true,
};
