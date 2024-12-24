import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const generateFilter = (params) => {
  const {
    userId,
    startDate,
    endDate,
    contentType,
    contentId,
    searchConsume,
    searchSend,
    searchResponse,
    searchError,
  } = params;

  const query: any = {};

  const qry: any = {};

  return query;
};

const carQueries = {
  cars: async (_root, params, { subdomain, models }: IContext) => {
    const selector = generateFilter(params);
    return paginate(models.AdConfig.find(selector), params);
  },
};

requireLogin(carQueries, 'carDetail');

checkPermission(carQueries, 'carsMain', 'showCars');
checkPermission(carQueries, 'carDetail', 'showCars');
checkPermission(carQueries, 'carCategories', 'showCars');
checkPermission(carQueries, 'carCategoriesTotalCount', 'showCars');
checkPermission(carQueries, 'carCategoryDetail', 'showCars');

export default carQueries;
