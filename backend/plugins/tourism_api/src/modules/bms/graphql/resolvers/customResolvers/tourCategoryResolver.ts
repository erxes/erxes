import { ITourCategoryDocument } from '@/bms/@types/tour';
import { IContext } from '~/connectionResolvers';

const collectCategoryIds = async (
  models: IContext['models'],
  rootCategoryId: string,
) => {
  const visited = new Set<string>([rootCategoryId]);
  let currentLevelIds: string[] = [rootCategoryId];

  while (currentLevelIds.length) {
    const children = await models.BmsTourCategories.find(
      { parentId: { $in: currentLevelIds } },
      { _id: 1 },
    ).lean();

    const nextLevelIds: string[] = [];
    for (const child of children) {
      const childId = String(child._id);
      if (!visited.has(childId)) {
        visited.add(childId);
        nextLevelIds.push(childId);
      }
    }

    currentLevelIds = nextLevelIds;
  }

  return Array.from(visited);
};

const tourCategory = {
  attachment(category: ITourCategoryDocument) {
    return category.attachment || null;
  },

  async tourCount(
    category: ITourCategoryDocument,
    _args,
    { models }: IContext,
  ) {
    const categoryIds = await collectCategoryIds(models, category._id);

    return models.Tours.countDocuments({
      $or: [
        { categories: { $in: categoryIds } },
        { categoryIds: { $in: categoryIds } },
        { categoryId: { $in: categoryIds } },
      ],
    });
  },

  async translations(
    category: any,
    { language }: { language?: string },
    { models }: IContext,
  ) {
    const query: any = { objectId: category._id };
    if (language) query.language = language;
    const translations =
      await models.TourCategoryTranslations.find(query).lean();

    // Include the main language value so the frontend always has every language
    if (category.branchId) {
      const branch = await models.Branches.findOne({ _id: category.branchId })
        .select('language')
        .lean();
      const mainLang = branch?.language;
      if (mainLang) {
        const alreadyExists = translations.some(
          (t: { language: string }) => t.language === mainLang,
        );

        if (!alreadyExists) {
          const original = await models.BmsTourCategories.findOne({
            _id: category._id,
          })
            .select('name')
            .lean();

          if (original?.name) {
            translations.unshift({
              _id: `${category._id}_${mainLang}`,
              objectId: category._id,
              language: mainLang,
              name: original.name,
            } as unknown as (typeof translations)[number]);
          }
        }
      }
    }

    return translations;
  },
};

export default tourCategory;
