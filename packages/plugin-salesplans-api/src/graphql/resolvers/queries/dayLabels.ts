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
  _ids: string[];
  date: Date;
  filterStatus: string;
  departmentId: string;
  branchId: string;
  labelId: string;
  dateType: string;
  startDate: Date;
  endDate: Date;
}

const getGenerateFilter = async (subdomain: string, params: IListArgs) => {
  const { _ids, date, filterStatus, branchId, departmentId, labelId } = params;

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

  if (labelId) {
    filter.labelId = { $in: [labelId] };
  }
  return filter;
};

const labelsQueries = {
  dayLabels: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    return paginate(
      models.DayLabels.find(filter)
        .sort({ date: -1 })
        .lean(),
      params
    );
  },

  dayLabelsCount: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    return await models.DayLabels.find(filter).count();
  }
};

moduleRequireLogin(labelsQueries);
moduleCheckPermission(labelsQueries, 'showSalesPlans');

export default labelsQueries;
