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
  date: Date;
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
    date,
    searchValue,
    filterStatus,
    branchId,
    departmentId,
    productId,
    productCategoryId
  } = params;

  const filter: any = {};

  if (filterStatus) {
    filter.status = filterStatus;
  }
  if (date) {
    filter.date = date;
  }

  if (branchId) {
    filter.branchId = branchId;
  }
  if (departmentId) {
    filter.departmentId = departmentId;
  }

  if (productId) {
    filter.productId = productId;
  } else {
    const productFilter: any = {};

    if (searchValue) {
      productFilter.query = {
        $or: [
          {
            name: { $regex: `.*${escapeRegExp(searchValue)}.*` }
          },
          {
            code: { $regex: `.*${escapeRegExp(searchValue)}.*` }
          },
          {
            barcodes: { $regex: `.*${escapeRegExp(searchValue)}.*` }
          }
        ]
      };
    }

    if (productCategoryId) {
      productFilter.categoryId = productCategoryId;
    }

    if (Object.keys(productFilter).length) {
      const limit = await sendProductsMessage({
        subdomain,
        action: 'count',
        data: {
          ...productFilter
        },
        isRPC: true,
        defaultValue: 0
      });

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: { ...productFilter, limit, fields: { _id: 1 } },
        isRPC: true,
        defaultValue: []
      });
      filter.productId = { $in: products.map(p => p._id) };
    }
  }

  return filter;
};

const labelsQueries = {
  dayPlans: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    return paginate(
      models.DayPlans.find(filter)
        .sort({ date: -1 })
        .lean(),
      params
    );
  },

  dayPlansCount: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    return await models.DayPlans.find(filter).count();
  },

  dayPlansSum: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    const plans = await models.DayPlans.find(filter, {
      values: 1,
      planCount: 1
    }).lean();

    const result: { [key: string]: number } = { planCount: 0 };

    for (const plan of plans || []) {
      result.planCount += plan.planCount;

      for (const timeValue of plan.values || []) {
        if (!Object.keys(result).includes(timeValue.timeId)) {
          result[timeValue.timeId] = 0;
        }
        result[timeValue.timeId] += Number(timeValue.count);
      }
    }
    return result;
  }
};

moduleRequireLogin(labelsQueries);
moduleCheckPermission(labelsQueries, 'showSalesPlans');

export default labelsQueries;
