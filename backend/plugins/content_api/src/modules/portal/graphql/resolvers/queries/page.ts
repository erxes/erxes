import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const queries = {
  cmsPages: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { searchValue } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list } = await cursorPaginate({
      model: models.Pages,
      params: args,
      query,
    });

    return list
  },

  cmsPageList: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const {
 
      searchValue,
    } = args;

    const clientPortalId = context.clientPortalId || args.clientPortalId;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Pages,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  cmsPage: async (parent: any, args: any, context: IContext) => {
    const { models, clientPortalId } = context;
    const { _id, slug } = args;

    if (!_id && !slug) {
      return null;
    }

    if (slug) {
      return models.Pages.findOne({ slug, clientPortalId });
    }

    return models.Pages.findOne({ _id });
  },
};

export default queries;
