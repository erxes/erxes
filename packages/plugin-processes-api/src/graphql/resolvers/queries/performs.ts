import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

interface IParam {
  searchValue?: string;
  ids: string[];
  excludeIds: boolean;
  overallWorkId: string;
}

const generateFilter = (params: IParam, commonQuerySelector) => {
  const { searchValue, ids, excludeIds, overallWorkId } = params;
  const selector: any = { ...commonQuerySelector };

  if (overallWorkId) {
    selector.overallWorkId = new RegExp(`.*${overallWorkId}.*`, 'i');
  }

  if (searchValue) {
    selector.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (ids && ids.length > 0) {
    selector._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  return selector;
};

const performQueries = {
  async performs(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    console.log('selector: ', selector);

    return paginate(models.Performs.find(selector).lean(), { ...params });
  },

  performsByOverallWorkId(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    return models.Performs.find(selector).lean();
  },

  performsTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    return models.Performs.find(selector).count();
  },

  performsByOverallWorkIdTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    return models.Performs.find(selector).count();
  },
  async allProducts(_root, _args, { subdomain }: IContext) {
    const productsCount =
      (await sendProductsMessage({
        subdomain,
        action: 'count',
        data: {},
        isRPC: true
      })) || null;

    const productsData =
      (await sendProductsMessage({
        subdomain,
        action: 'find',
        data: { limit: productsCount },
        isRPC: true
      })) || [];

    return productsData;
  }
};

// checkPermission(workQueries, 'flows', 'showWorks');

export default performQueries;
