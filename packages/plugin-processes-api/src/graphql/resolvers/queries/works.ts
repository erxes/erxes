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

const workQueries = {
  works(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector }: IContext
  ) {
    console.log('works step 1');

    const selector = generateFilter(params, commonQuerySelector);
    return paginate(models.Works.find(selector).lean(), { ...params });
  },

  workTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    return models.Works.find(selector).count();
  }
};

// checkPermission(workQueries, 'flows', 'showWorks');

export default workQueries;
