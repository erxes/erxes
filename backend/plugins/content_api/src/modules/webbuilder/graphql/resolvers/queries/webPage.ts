import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { getQueryBuilder } from '@/cms/utils/query-builders';
import { Resolver } from 'erxes-api-shared/core-types';

import { IContext } from '~/connectionResolvers';

class WebPageQueryResolver extends BaseQueryResolver {
  async cpWebPages(_parent: unknown, args: any, context: IContext) {
    const { language, clientPortalId } = args;
    const { models } = context;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const queryBuilder = getQueryBuilder('page', models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list } = await this.getListWithTranslations(
      models.WebPages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE,
    );

    return list;
  }

  async cpWebPageList(_parent: unknown, args: any, context: IContext) {
    const { language, clientPortalId } = args;
    const { models } = context;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const queryBuilder = getQueryBuilder('page', models);
    const query = queryBuilder.buildQuery({ ...args, clientPortalId });

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.WebPages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE,
    );

    return { pages: list, totalCount, pageInfo };
  }

  async cpWebPage(_parent: unknown, args: any, context: IContext) {
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
      models.WebPages,
      query,
      language,
      FIELD_MAPPINGS.PAGE,
    );
  }
}

export const webPageQueries: Record<string, Resolver> = {
  cpWebPages: (_parent: unknown, args: any, context: IContext) =>
    new WebPageQueryResolver(context).cpWebPages(_parent, args, context),
  cpWebPageList: (_parent: unknown, args: any, context: IContext) =>
    new WebPageQueryResolver(context).cpWebPageList(_parent, args, context),
  cpWebPage: (_parent: unknown, args: any, context: IContext) =>
    new WebPageQueryResolver(context).cpWebPage(_parent, args, context),
};

webPageQueries.cpWebPages.wrapperConfig = {
  forClientPortal: true,
};

webPageQueries.cpWebPageList.wrapperConfig = {
  forClientPortal: true,
};

webPageQueries.cpWebPage.wrapperConfig = {
  forClientPortal: true,
};

