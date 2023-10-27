import { paginate } from '@erxes/api-utils/src/core';
import { sendProductsMessage } from '../../../messageBroker';
// import {
//   checkPermission,
//   requireLogin
// } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { FLOW_STATUSES } from '../../../models/definitions/constants';

interface IParam {
  categoryId?: string;
  searchValue?: string;
  ids?: string[];
  isSub?: boolean;
  excludeIds?: boolean;
  branchId?: string;
  departmentId?: string;
  status?: string;
  validation?: string;
}

const generateFilter = async (
  subdomain: string,
  params: IParam,
  commonQuerySelector
) => {
  const {
    categoryId,
    searchValue,
    ids,
    isSub,
    excludeIds,
    branchId,
    departmentId,
    status,
    validation
  } = params;
  const selector: any = { ...commonQuerySelector };

  if (categoryId) {
    if (categoryId === 'unknownCategory') {
      selector.productId = { $in: ['', null, undefined] };
    } else {
      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: { query: {}, categoryId, fields: { _id: 1 }, limit: 10000 },
        isRPC: true,
        defaultValue: []
      });

      const productIds = products.map(p => p._id);
      selector.productId = { $in: productIds };
    }
  }

  if (isSub !== undefined) {
    selector.isSub = isSub;
  }

  if (searchValue) {
    selector.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (ids && ids.length > 0) {
    selector._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  if (branchId) {
    selector.latestBranchId = branchId;
  }

  if (departmentId) {
    selector.latestDepartmentId = departmentId;
  }

  if (status) {
    selector.status = status;
  } else {
    selector.status = { $ne: FLOW_STATUSES.ARCHIVED };
  }

  if (validation) {
    if (validation === 'true') {
      selector.flowValidation = '';
    } else {
      selector.flowValidation = { $regex: validation };
    }
  }

  return selector;
};

const flowQueries = {
  async flows(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector, subdomain }: IContext
  ) {
    const selector = await generateFilter(
      subdomain,
      params,
      commonQuerySelector
    );

    return paginate(
      models.Flows.find(selector)
        .sort({
          code: 1
        })
        .lean(),
      { ...params }
    );
  },

  flowsAll(_root, _arg, { models }: IContext) {
    // const selector = generateFilter(params, commonQuerySelector);

    return models.Flows.find()
      .sort({
        code: 1
      })
      .lean();
  },

  async flowTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models, subdomain }: IContext
  ) {
    const selector = await generateFilter(
      subdomain,
      params,
      commonQuerySelector
    );

    return models.Flows.find(selector).count();
  },

  /**
   * Get one flow
   */
  flowDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Flows.findOne({ _id });
  }

  // /**
  //  * Get receive data
  //  */
  // async testGetReceiveDatas(_root, _args, { models, subdomain }: IContext) {
  //   const data = {
  //     salesLogId: 'lfkajsdlfjalskdj',
  //     date: new Date(),
  //     branchId: 'bz9ExXQ9Tfa8Qs6Tp',
  //     departmentId: 'DWkmyHbxF7u57x8h7',
  //     intervalId: 'dfadfadfa',
  //     interval: {
  //       intervals: [
  //         { productId: 'Q7r2s3fJM3F88YkTD', count: 3 },
  //         { productId: 'HPSTWpeP5pcS4vTzj', count: 2 }
  //       ]
  //     }
  //   };
  //   const response = await rf(models, subdomain, { data });

  //   return response;
  // }
};

// checkPermission(flowQueries, 'flowDetail', 'showJobs');
// checkPermission(flowQueries, 'flows', 'showJobs');

export default flowQueries;
