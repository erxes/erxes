import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { rf } from '../../../utils/receiveFlow';

interface IParam {
  categoryId: string;
  searchValue?: string;
  ids: string[];
  excludeIds: boolean;
}

const generateFilter = (params: IParam, commonQuerySelector) => {
  const { categoryId, searchValue, ids, excludeIds } = params;
  const selector: any = { ...commonQuerySelector };

  if (categoryId) {
    selector.categoryId = categoryId;
  }

  if (searchValue) {
    selector.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (ids && ids.length > 0) {
    selector._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  return selector;
};

const flowQueries = {
  flows(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector }: IContext
  ) {
    console.log('flows step 1');
    const selector = generateFilter(params, commonQuerySelector);

    return paginate(
      models.Flows.find(selector)
        .sort({
          code: 1
        })
        .lean(),
      { ...params }
    );
  },

  flowTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);

    return models.Flows.find(selector).count();
  },

  /**
   * Get one flow
   */
  flowDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Flows.findOne({ _id });
  },

  /**
   * Get receive data
   */
  async testGetReceiveDatas(_root, _args, { models, subdomain }: IContext) {
    const data = {
      salesLogId: 'lfkajsdlfjalskdj',
      date: new Date(),
      branchId: 'X5BcGHpzxofkTq8TL',
      departmentId: 'ELea5cmuCwuQZy7qH',
      interval: {
        intervals: [
          { productId: 'Q7r2s3fJM3F88YkTD', count: 3 },
          { productId: 'HPSTWpeP5pcS4vTzj', count: 2 }
        ]
      }
    };
    const response = await rf(models, subdomain, { data });

    return response;
  }
};

// checkPermission(flowQueries, 'flowDetail', 'showFlows');
// checkPermission(flowQueries, 'flows', 'showFlows');

export default flowQueries;
