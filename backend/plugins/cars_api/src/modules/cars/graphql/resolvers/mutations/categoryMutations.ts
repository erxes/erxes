import { IContext } from '~/connectionResolvers';
import { requireLogin, checkPermission } from 'erxes-api-shared/core-modules';

import {
  ICarCategory,
  ICarCategoryDocument,
} from '~/modules/cars/@types/category';

export const carCategoryMutations = {
  carCategoriesAdd: async (
    _root: undefined,
    doc: ICarCategory,
    { models }: IContext,
  ) => {
    return await models.CarCategories.carsCategoryAdd({ ...doc });
  },

  carCategoriesEdit: async (
    _root: undefined,
    { _id, ...doc }: ICarCategoryDocument,
    { models }: IContext,
  ) => {
    return await models.CarCategories.carsCategoriesEdit(_id, doc);
  },

  carCategoriesRemove: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.CarCategories.carsCategoriesRemove(_id);
  },
};

requireLogin(carCategoryMutations, 'manageCars');

checkPermission(carCategoryMutations, 'carCategoriesAdd', 'manageCars');
checkPermission(carCategoryMutations, 'carCategoriesEdit', 'manageCars');
checkPermission(carCategoryMutations, 'carCategoriesRemove', 'manageCars');
