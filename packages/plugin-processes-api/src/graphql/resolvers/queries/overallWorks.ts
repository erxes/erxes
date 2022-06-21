import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

interface IParam {
  searchValue?: string;
  ids: string[];
  excludeIds: boolean;
}

const generateFilter = (params: IParam, commonQuerySelector) => {
  const { searchValue, ids, excludeIds } = params;
  const selector: any = { ...commonQuerySelector };

  if (searchValue) {
    selector.name = new RegExp(`.*${searchValue}.*`, 'i');
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

  overallWorkTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    return models.OverallWorks.find(selector).count();
  }
};

checkPermission(overallWorkQueries, 'overalWorks', 'showOverallWorks');

export default overallWorkQueries;
