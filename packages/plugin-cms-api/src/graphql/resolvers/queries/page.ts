import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  cmsPages: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { page, perPage, searchValue, language } = args;
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
    const pages = await paginate(models.Pages.find(query), { page, perPage });

    if (!language) {
      return pages;
    }

    const pageIds = pages.map((page) => page._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: pageIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    const pagesWithTranslations = pages.map((page) => {
      const translation = translationsMap[page._id.toString()];
      page.name = translation?.title || page.name;
      page.description = translation?.content || page.description;

      return page;
    });

    return pagesWithTranslations;
  },

  cmsPageList: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const {
      page = 1,
      perPage = 20,
      sortField = 'createdAt',
      sortDirection = 'desc',
      searchValue,
      language,
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

    const totalCount = await models.Pages.find(query).countDocuments();

    const pages = await paginate(
      models.Pages.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    const totalPages = Math.ceil(totalCount / perPage);

    if (!language) {
      return { totalCount, totalPages, currentPage: page, pages };
    }

    const pageIds = pages.map((page) => page._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: pageIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    const pagesWithTranslations = pages.map((page) => {
      const translation = translationsMap[page._id.toString()];
      page.name = translation?.title || page.name;
      page.description = translation?.content || page.description;
      return page;
    });

    return {
      totalCount,
      totalPages,
      currentPage: page,
      pages: pagesWithTranslations,
    };
  },

  cmsPage: async (parent: any, args: any, context: IContext) => {
    const { models, clientPortalId } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) {
      return null;
    }

    if (slug) {
      return models.Pages.findOne({ slug, clientPortalId });
    }

    const page = await models.Pages.findOne({ _id });

    if (!page) {
      return null;
    }

    if (!language) {
      return page;
    }

    const translation = await models.PostTranslations.findOne({
      postId: _id,
      language,
    }).lean();

    page.name = translation?.title || page.name;
    page.description = translation?.content || page.description;

    return page;
  },
};

export default queries;
