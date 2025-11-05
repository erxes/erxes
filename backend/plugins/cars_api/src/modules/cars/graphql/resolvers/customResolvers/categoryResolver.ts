import { ICarCategoryDocument } from '~/modules/cars/@types/category';
import { IContext } from '~/connectionResolvers';

export default {
  __resolveReference: async (
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.CarCategories.findOne({ _id });
  },
  isRoot: (category: ICarCategoryDocument) => {
    return !category.parentId;
  },

  async carCount(
    category: ICarCategoryDocument,
    _args: any,
    { models }: IContext,
  ) {
    return models.Cars.countDocuments({
      categoryId: category._id,
    });
  },
};
