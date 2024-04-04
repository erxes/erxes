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
  minMultiplier: number;
  maxMultiplier: number;
}

const getGenerateFilter = (params: IListArgs) => {
  const {
    _ids,
    searchValue,
    filterStatus,
    minMultiplier,
    maxMultiplier
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

  const intervalFilter: any = {};
  if (minMultiplier) {
    intervalFilter.$gte = minMultiplier;
  }
  if (maxMultiplier) {
    intervalFilter.$lte = maxMultiplier;
  }

  if (Object.keys(intervalFilter).length) {
    filter.multiplier = intervalFilter;
  }
  return filter;
};

const labelsQueries = {
  spLabels: async (_root: any, params: IListArgs, { models }: IContext) => {
    const filter = getGenerateFilter(params);

    return paginate(models.Labels.find(filter).lean(), params);
  },

  spLabelsCount: async (
    _root: any,
    params: IListArgs,
    { models }: IContext
  ) => {
    const filter = getGenerateFilter(params);
    return await models.Labels.find(filter).count();
  },

  timeframes: async (_root: any, _args: any, { models }: IContext) => {
    return await models.Timeframes.find({ status: { $ne: 'deleted' } })
      .sort({ startTime: 1 })
      .lean();
  }
};

moduleRequireLogin(labelsQueries);
moduleCheckPermission(labelsQueries, 'showSalesPlans');

export default labelsQueries;
