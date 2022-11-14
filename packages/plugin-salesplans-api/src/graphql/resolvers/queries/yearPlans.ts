import {
  moduleRequireLogin,
  moduleCheckPermission
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';
import { sendProductsMessage } from '../../../messageBroker';

interface IListArgs {
  page: number;
  perPage: number;
  sortField: string;
  sortDirection: number;
  _ids: string[];
  year: number;
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

const getGenerateFilter = async (subdomain: string, params: IListArgs) => {
  const {
    _ids,
    year,
    searchValue,
    filterStatus,
    branchId,
    departmentId,
    productId,
    productCategoryId
  } = params;

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
  if (year) {
    filter.year = year;
  }

  if (branchId) {
    filter.branchId = branchId;
  }
  if (departmentId) {
    filter.departmentId = departmentId;
  }
  if (productId) {
    filter.productId = productId;
  }
  if (productCategoryId) {
    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: { categoryId: productCategoryId, fields: { _id: 1 } },
      isRPC: true,
      defaultValue: []
    });

    filter.productId = { $in: products.map(p => p._id) };
  }
  return filter;
};

const labelsQueries = {
  yearPlans: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    return paginate(models.YearPlans.find(filter).lean(), params);
  },

  yearPlansCount: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    return await models.YearPlans.find(filter).count();
  }
};

moduleRequireLogin(labelsQueries);
moduleCheckPermission(labelsQueries, 'showSalesPlans');

export default labelsQueries;
