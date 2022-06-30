import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

interface IParam {
  searchValue?: string;
  inBranchId?: string;
  inDepartmentId?: string;
  outBranchId?: string;
  outDepartmentId?: string;
  ids: string[];
  excludeIds: boolean;
}

const generateFilter = (params: IParam, commonQuerySelector) => {
  const {
    searchValue,
    ids,
    excludeIds,
    inBranchId,
    inDepartmentId,
    outBranchId,
    outDepartmentId
  } = params;
  const selector: any = { ...commonQuerySelector };

  console.log('params params:', params);

  if (searchValue) {
    selector.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (inBranchId && inDepartmentId && outBranchId && outDepartmentId) {
    selector.inBranchId = inBranchId;
    selector.inDepartmentId = inDepartmentId;
    selector.outBranchId = outBranchId;
    selector.outDepartmentId = outDepartmentId;
  }

  if (ids && ids.length > 0) {
    selector._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  return selector;
};

const overallWorkQueries = {
  overallWorks(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);
    return paginate(models.OverallWorks.find(selector).lean(), { ...params });
  },

  overallWorksSideBar(
    _root,
    params: IParam,
    { models, commonQuerySelector }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);
    console.log(selector);
    return models.OverallWorks.find(selector).lean();
  },

  overallWorksTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    return models.OverallWorks.find(selector).count();
  }
};

// checkPermission(overallWorkQueries, 'overalWorks', 'showOverallWorks');

export default overallWorkQueries;
