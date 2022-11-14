import {
  moduleRequireLogin,
  moduleCheckPermission
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';

interface IListArgs {
  page: number;
  perPage: number;
  sortField: string;
  sortDirection: number;
  _ids: string[];
  searchValue: string;
  filterStatus: string;
  departmentId: string;
  branchId: string;
  productId: string;
  productCategoryId: string;
  minValue: number;
  maxValue: number;
  dateType: string;
  startDate: Date;
  endDate: Date;
}

const getGenerateFilter = (params: IListArgs) => {
  const { _ids, searchValue, filterStatus } = params;

  const filter: any = {};
  if (searchValue) {
    filter.$or = [
      {
        title: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] }
      },
      {
        effect: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] }
      },
      {
        description: {
          $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')]
        }
      }
    ];
  }

  if (filterStatus) {
    filter.status = filterStatus;
  }
  return filter;
};

const labelsQueries = {
  yearPlans: async (_root: any, params: IListArgs, { models }: IContext) => {
    const filter = getGenerateFilter(params);

    return paginate(models.YearPlans.find(filter).lean(), params);
  },

  yearPlansCount: async (
    _root: any,
    params: IListArgs,
    { models }: IContext
  ) => {
    const filter = getGenerateFilter(params);
    return await models.YearPlans.find(filter).count();
  }
};

moduleRequireLogin(labelsQueries);
moduleCheckPermission(labelsQueries, 'showSalesPlans');

export default labelsQueries;
