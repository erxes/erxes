import { ICMSPageDocument } from '@/cms/@types/cms';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import {
  assertCmsAccessByClientPortal,
  getAccessibleCmsClientPortalIds,
} from '@/cms/utils/cms-access';
import { getQueryBuilder } from '@/cms/utils/query-builders';
import { requireCmsPermission } from '@/cms/utils/permissions';
import { ICursorPaginateParams, Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CMS_POST_ACTIONS } from '~/meta/permissions';

class PageQueryResolver extends BaseQueryResolver {
  async contentGlobalSearchPages(
    _parent: undefined,
    args: ICursorPaginateParams & { searchValue?: string },
    context: IContext,
  ) {
    const { models, user } = context;
    const permissionScope = await requireCmsPermission(
      context,
      CMS_POST_ACTIONS.read,
    );
    const accessibleClientPortalIds =
      await getAccessibleCmsClientPortalIds(context);
    const query: FilterQuery<ICMSPageDocument> = {};
    const searchValue = args.searchValue?.trim();

    if (accessibleClientPortalIds) {
      query.clientPortalId = { $in: accessibleClientPortalIds };
    }

    if (!user?.isOwner && permissionScope !== 'all') {
      query.createdUserId = user?._id;
    }

    if (searchValue) {
      const searchPattern = new RegExp(escapeRegExp(searchValue), 'i');
      query.$or = [
        { name: searchPattern },
        { slug: searchPattern },
        { description: searchPattern },
      ];
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<ICMSPageDocument>({
        model: models.Pages,
        params: {
          ...args,
          orderBy: { updatedAt: -1 },
        },
        query,
      });

    return { pages: list, totalCount, pageInfo };
  }

  async cmsPages(_parent: any, args: any, context: IContext) {
    const { language, clientPortalId } = args;
    const { models } = context;

    if (!clientPortalId) throw new Error('clientPortalId is required');

    await assertCmsAccessByClientPortal(context, clientPortalId);

    const orderBy = args.orderBy || { createdAt: -1 };

    const queryBuilder = getQueryBuilder('page', models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list } = await this.getListWithTranslations(
      models.Pages,
      query,
      { ...args, clientPortalId, language, orderBy },
      FIELD_MAPPINGS.PAGE,
      'page',
    );

    return list;
  }

  async cmsPageList(_parent: any, args: any, context: IContext) {
    const { language, clientPortalId } = args;
    const { models } = context;

    if (!clientPortalId) throw new Error('clientPortalId is required');

    await assertCmsAccessByClientPortal(context, clientPortalId);

    const orderBy = args.orderBy || { createdAt: -1 };

    const queryBuilder = getQueryBuilder('page', models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.Pages,
      query,
      { ...args, clientPortalId, language, orderBy },
      FIELD_MAPPINGS.PAGE,
      'page',
    );

    return { pages: list, totalCount, pageInfo };
  }

  async cmsPage(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, slug, language, clientPortalId } = args;

    if (!_id && !slug) return null;

    const query = slug
      ? { slug, ...(clientPortalId ? { clientPortalId } : {}) }
      : { _id };

    return this.getItemWithTranslation(
      models.Pages,
      query,
      language,
      FIELD_MAPPINGS.PAGE,
      clientPortalId,
      'page',
    );
  }

  async cpPages(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { language } = args;
    const clientPortalId = clientPortal._id;

    const query: any = { clientPortalId };

    const { list } = await this.getListWithTranslations(
      models.Pages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE,
      'page',
    );

    return list;
  }

  async cpPageList(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { language } = args;
    const clientPortalId = clientPortal._id;

    const query: any = { clientPortalId };

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.Pages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE,
      'page',
    );

    return { pages: list, totalCount, pageInfo };
  }

  async cpCmsPageDetail(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { _id, slug, language } = args;
    const clientPortalId = clientPortal?._id;

    if (!_id && !slug) return null;

    const query = slug ? { slug, clientPortalId } : { _id, clientPortalId };

    return this.getItemWithTranslation(
      models.Pages,
      query,
      language,
      FIELD_MAPPINGS.PAGE,
      clientPortalId,
      'page',
    );
  }
}

const queries: Record<string, Resolver> = {
  contentGlobalSearchPages: (
    _parent: undefined,
    args: ICursorPaginateParams & { searchValue?: string },
    context: IContext,
  ) =>
    new PageQueryResolver(context).contentGlobalSearchPages(
      _parent,
      args,
      context,
    ),
  cmsPages: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPages(_parent, args, context),

  cmsPageList: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPageList(_parent, args, context),

  cmsPage: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cmsPage(_parent, args, context),

  cpPages: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cpPages(_parent, args, context),

  cpPageList: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cpPageList(_parent, args, context),

  cpCmsPageDetail: (_parent: any, args: any, context: IContext) =>
    new PageQueryResolver(context).cpCmsPageDetail(_parent, args, context),
};

queries.cpPages.wrapperConfig = { forClientPortal: true };
queries.cpPageList.wrapperConfig = { forClientPortal: true };
queries.cpCmsPageDetail.wrapperConfig = { forClientPortal: true };

export default queries;
