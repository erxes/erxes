import {
  moduleRequireLogin,
  moduleCheckPermission
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';

interface IListArgs {
  page: number;
  perPage: number;
  sortField: string;
  sortDirection: number;
  departmentId: string;
  branchId: string;
  productCategoryId: string;
}

const getGenerateFilter = async (params: IListArgs) => {
  const { branchId, departmentId, productCategoryId } = params;

  const filter: any = {};

  if (branchId) {
    filter.branchId = branchId;
  }
  if (departmentId) {
    filter.departmentId = departmentId;
  }
  if (productCategoryId) {
    filter.productCategoryId = productCategoryId;
  }

  return filter;
};

const timeProportionsQuery = {
  timeProportions: async (
    _root: any,
    params: IListArgs,
    { models }: IContext
  ) => {
    const filter = await getGenerateFilter(params);
    return paginate(
      models.TimeProportions.find(filter)
        .sort({ date: -1 })
        .lean(),
      params
    );
  },

  timeProportionsCount: async (
    _root: any,
    params: IListArgs,
    { models }: IContext
  ) => {
    const filter = await getGenerateFilter(params);
    return await models.TimeProportions.find(filter).count();
  }
};

moduleRequireLogin(timeProportionsQuery);
moduleCheckPermission(timeProportionsQuery, 'showSalesPlans');

export default timeProportionsQuery;
