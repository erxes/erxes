import { IContext } from '~/connectionResolvers';
import { ICarParams } from '~/modules/cars/@types/car';
import { generateFilter } from './carQueries';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { ICarCategoryDocument } from '~/modules/cars/@types/category';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';

export const CarCategoryQueries = {
  carCategoryDetail: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.CarCategories.findOne({ _id });
  },
  carCategories: async (
    _root: undefined,
    params: ICarParams,
    { commonQuerySelector, models }: IContext,
  ) => {
    const filter = await generateFilter(params, commonQuerySelector, models);

    return await cursorPaginate<ICarCategoryDocument>({
      model: models.CarCategories,
      params,
      query: filter,
    });
  },
};

requireLogin(CarCategoryQueries, 'showCarCategories');

checkPermission(CarCategoryQueries, 'carCategoryDetail', 'showCarCategories');
checkPermission(CarCategoryQueries, 'carCategories', 'showCarCategories');
