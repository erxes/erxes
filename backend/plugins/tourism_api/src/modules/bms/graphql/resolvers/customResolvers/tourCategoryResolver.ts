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
        { tagIds: { $in: categoryIds } },
        { categoryId: { $in: categoryIds } },
      ],
    });
  },
};

export default tourCategory;
