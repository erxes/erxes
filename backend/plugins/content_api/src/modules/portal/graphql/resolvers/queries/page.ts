import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IPageDocument } from '../../../@types/page';

const queries = {
  cmsPages: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { searchValue, language } = args;
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

    if (!language) {
      return list;
    }

    const pageIds = list.map((page) => page._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: pageIds },
      language,
    }).lean();

    // ✅ Build a translation map for O(1) lookup
    const translationMap = translations.reduce((acc, t) => {
      acc[t.postId.toString()] = t;
      return acc;
    }, {} as Record<string, any>);

    const pagesWithTranslations = list.map((page) => {
      const translation = translationMap[page._id.toString()];
      return {
        ...page,
        ...(translation && {
          name: translation.title || page.name,
          description: translation.content || page.description,
        }),
      };
    });

    return pagesWithTranslations;
  },

  cmsPageList: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { language, searchValue } = args;

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

    if (!language) {
      return { list, totalCount, pageInfo };
    }

    const pageIds = list.map((page) => page._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: pageIds },
      language,
    }).lean();

    // ✅ Build a translation map for O(1) lookup
    const translationMap = translations.reduce((acc, t) => {
      acc[t.postId.toString()] = t;
      return acc;
    }, {} as Record<string, any>);

    const pagesWithTranslations = list.map((page) => {
      const translation = translationMap[page._id.toString()];
      return {
        ...page,
        ...(translation && {
          name: translation.title || page.name,
          description: translation.content || page.description,
        }),
      };
    });

    return { list: pagesWithTranslations, totalCount, pageInfo };
  },

  cmsPage: async (parent: any, args: any, context: IContext) => {
    const { models, clientPortalId } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) {
      return null;
    }

    let page: IPageDocument | null = null;
    if (slug) {
      page = await models.Pages.findOne({ slug, clientPortalId });
    } else {
      page = await models.Pages.findOne({ _id });
    }

    if (!page) {
      return null;
    }

    if (!language) {
      return page;
    }

    const translation = await models.PostTranslations.findOne({
      postId: page._id,
      language,
    });

    return {
      ...page,
      ...(translation && {
        name: translation.title || page.name,
        description: translation.content || page.description,
      }),
    };
  },
};

export default queries;
