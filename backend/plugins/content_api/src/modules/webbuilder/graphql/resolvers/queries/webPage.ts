import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';

class WebPageQueryResolver extends BaseQueryResolver {
  async cpWebPages(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { webId, searchValue, language } = args;

    if (!webId) throw new Error('webId is required');

    const clientPortalId = clientPortal?._id;

    const query: any = { webId };
    if (clientPortalId) query.clientPortalId = clientPortalId;
    if (searchValue) query.name = { $regex: searchValue, $options: 'i' };

    const { list } = await this.getListWithTranslations(
      models.WebPages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE,
      'webPage',
    );

    return list;
  }

  async cpWebPageList(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { webId, searchValue, language } = args;

    if (!webId) throw new Error('webId is required');

    const clientPortalId = clientPortal?._id;

    const query: any = { webId };
    if (clientPortalId) query.clientPortalId = clientPortalId;
    if (searchValue) query.name = { $regex: searchValue, $options: 'i' };

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.WebPages,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.PAGE,
      'webPage',
    );

    return { pages: list, totalCount, pageInfo };
  }

  async cpWebPage(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { _id, slug, webId, language } = args;

    if (!_id && !slug) return null;

    const clientPortalId = clientPortal?._id;

    const query: any = {};
    if (clientPortalId) query.clientPortalId = clientPortalId;
    if (slug) {
      query.slug = slug;
      query.webId = webId;
    } else {
      query._id = _id;
    }

    return this.getItemWithTranslation(
      models.WebPages,
      query,
      language,
      FIELD_MAPPINGS.PAGE,
      clientPortalId,
      'webPage',
    );
  }
}

export const webPageQueries: Record<string, Resolver> = {
  cpWebPages: (_parent: any, args: any, context: IContext) =>
    new WebPageQueryResolver(context).cpWebPages(_parent, args, context),

  cpWebPageList: (_parent: any, args: any, context: IContext) =>
    new WebPageQueryResolver(context).cpWebPageList(_parent, args, context),

  cpWebPage: (_parent: any, args: any, context: IContext) =>
    new WebPageQueryResolver(context).cpWebPage(_parent, args, context),
};

webPageQueries.cpWebPages.wrapperConfig = { forClientPortal: true };
webPageQueries.cpWebPageList.wrapperConfig = { forClientPortal: true };
webPageQueries.cpWebPage.wrapperConfig = { forClientPortal: true };
