import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import {
  IRemainderParams,
  IRemainderProductsParams,
  IRemaindersParams
} from '../../../models/definitions/remainders';
import { getPosOrders } from '../utils/posOrders';
import { getProcesses } from '../utils/processes';
import { getSafeRemainders } from '../utils/safeRemainders';

const remainderQueries = {
  remainders: async (
    _root: any,
    params: IRemaindersParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainders(subdomain, params);
  },

  remainderDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Remainders.getRemainder(_id);
  },

  remainderCount: async (
    _root: any,
    params: IRemainderParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderCount(subdomain, params);
  },

  remainderProducts: async (
    _root: any,
    params: IRemainderProductsParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderProducts(subdomain, params);
  },

  remaindersLog: async (
    _root: any,
    params: {
      categoryId: string;
      productIds: string[];
      branchId: string;
      departmentId: string;
      beginDate: Date;
      endDate: Date;
      isDetailed: boolean;
    },
    { models, subdomain }: IContext
  ) => {
    const {
      categoryId,
      productIds,
      endDate,
      beginDate,
      branchId,
      departmentId
    } = params;
    const bDate = new Date(beginDate);
    const eDate = new Date(endDate);

    const productFilter: any = {};
    if (categoryId) {
      const productCategories = await sendProductsMessage({
        subdomain,
        action: 'categories.withChilds',
        data: {
          _id: categoryId
        },
        isRPC: true,
        defaultValue: []
      });
      const categoryIds = productCategories.map((item: any) => item._id);
      productFilter.categoryId = { $in: categoryIds };
    }
    if (productIds && productIds.length) {
      productFilter._id = { $in: productIds };
    }

    const limit = await sendProductsMessage({
      subdomain,
      action: 'count',
      data: { query: productFilter },
      isRPC: true
    });

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: { query: productFilter, limit },
      isRPC: true
    });

    const beProductIds = products.map(p => p._id);
    const productById = {};

    for (const product of products) {
      productById[product._id] = product;
    }

    const branch = await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: branchId },
      isRPC: true
    });

    const department = await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: departmentId },
      isRPC: true
    });

    let result = {};

    result = await getSafeRemainders(
      models,
      params,
      result,
      branch,
      department,
      productById,
      beProductIds
    );

    result = await getProcesses(
      subdomain,
      params,
      result,
      branch,
      department,
      productById,
      beProductIds
    );

    result = await getPosOrders(
      subdomain,
      params,
      result,
      branch,
      department,
      productById,
      beProductIds
    );

    return result;
  }
};

requireLogin(remainderQueries, 'tagDetail');
checkPermission(remainderQueries, 'remainders', 'showTags', []);

export default remainderQueries;
