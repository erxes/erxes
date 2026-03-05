import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const webPageQueries: Record<string, Resolver> = {
  async cpWebPages(_parent: unknown, args: any, { models }: IContext) {
    const { webId, searchValue } = args;

    if (!webId) throw new Error('webId is required');

    const query: any = { webId };
    if (searchValue) {
      query.name = { $regex: searchValue, $options: 'i' };
    }

    return models.WebPages.find(query).sort({ name: 1 }).lean();
  },

  async cpWebPageList(_parent: unknown, args: any, { models }: IContext) {
    const { webId, searchValue } = args;

    if (!webId) throw new Error('webId is required');

    const query: any = { webId };
    if (searchValue) {
      query.name = { $regex: searchValue, $options: 'i' };
    }

    const pages = await models.WebPages.find(query).sort({ name: 1 }).lean();
    const totalCount = await models.WebPages.countDocuments(query);

    return { pages, totalCount, pageInfo: null };
  },

  async cpWebPage(_parent: unknown, args: any, { models }: IContext) {
    const { _id, slug, webId } = args;

    if (!_id && !slug) return null;

    if (slug) return models.WebPages.findOne({ slug, webId }).lean();
    return models.WebPages.findOne({ _id }).lean();
  },
};

webPageQueries.cpWebPages.wrapperConfig = { forClientPortal: true };
webPageQueries.cpWebPageList.wrapperConfig = { forClientPortal: true };
webPageQueries.cpWebPage.wrapperConfig = { forClientPortal: true };