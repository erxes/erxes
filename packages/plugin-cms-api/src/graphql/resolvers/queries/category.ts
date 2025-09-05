import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  /**
   * Cms categories list
   */
  async cmsCategories(
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> {
    const { models } = context;
    const {
      searchValue,
      status,
      page = 1,
      perPage = 20,
      sortField = 'name',
      sortDirection = 'asc',
      language,
    } = args;
    const clientPortalId = args.clientPortalId || context.clientPortalId;
    const query = {
      clientPortalId,
      ...(status && { status }),
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const categories = await paginate(
      models.Categories.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    if (!language) {
      return categories;
    }

    const categoryIds = categories.map((category) => category._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: categoryIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    const categoriesWithTranslations = categories.map((category) => {
      const translation = translationsMap[category._id.toString()];
      category.name = translation?.title || category.name;
      category.description = translation?.excerpt || translation?.content || category.description;
      return category;
    });

    return categoriesWithTranslations;
  },

  /**
   * Cms category
   */
  async cmsCategory(_parent: any, args: any, context: IContext): Promise<any> {
    const { models, clientPortalId } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) {
      return null;
    }

    const category = await models.Categories.findOne({ _id });

    if (!category) {
      return null;
    }

    if (!language) {
      return category;
    }

    const translation = await models.PostTranslations.findOne({
      postId: _id,
      language,
    }).lean();

    category.name = translation?.title || category.name;
    category.description = translation?.excerpt || translation?.content || category.description;

    return category;
  },
};

export default queries;
