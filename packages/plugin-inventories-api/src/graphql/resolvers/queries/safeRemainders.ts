import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

const generateFilterItems = async (params, subdomain) => {
  const { remainderId, productCategoryId, status, diffType } = params;
  const query: any = { remainderId };

  if (productCategoryId) {
    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: { query: {}, categoryId: productCategoryId },
      isRPC: true,
      defaultValue: []
    });

    const productIds = products.map(p => p._id);
    query.productId = { $in: productIds };
  }

  if (status) {
    query.status = status;
  }

  if (diffType) {
    const diffTypes = diffType.split(',');
    let op;
    if (diffTypes.includes('gt')) {
      op = '>';
    }
    if (diffTypes.includes('lt')) {
      op = '<';
    }
    if (op) {
      if (diffTypes.includes('eq')) {
        op = `${op}=`;
      }
    } else {
      if (diffTypes.includes('eq')) {
        op = `===`;
      }
    }
    query.$where = `this.preCount ${op} this.count`;
  }

  return query;
};

const safeRemainderQueries = {
  /**
   * Get one tag
   */
  safeRemainderDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.SafeRemainders.findOne({ _id });
  },

  safeRemainders: async (_root, params, { models, subdomain }: IContext) => {
    const query: any = {};

    if (params.departmentId) {
      query.departmentId = params.departmentId;
    }

    if (params.branchId) {
      query.branchId = params.branchId;
    }

    if (params.searchValue) {
      query.description = params.searchValue;
    }

    const dateQry: any = {};
    if (params.beginDate) {
      dateQry.$gte = new Date(params.beginDate);
    }
    if (params.endDate) {
      dateQry.$lte = new Date(params.endDate);
    }
    if (Object.keys(dateQry).length) {
      query.date = dateQry;
    }

    if (params.productId) {
      let allRemainders = await models.SafeRemainders.find(query).lean();
      const remIds = allRemainders.map(r => r._id);

      const items = await models.SafeRemainderItems.find({
        remainderId: { $in: remIds },
        productId: params.productId
      }).lean();

      const lastRemIds = new Set(items.map(i => i.remainderId) || []);
      query._id = { $in: lastRemIds };
    }

    return {
      totalCount: await models.SafeRemainders.find(query).count(),
      remainders: await paginate(models.SafeRemainders.find(query), {
        ...params
      })
    };
  },

  safeRemainderItems: async (
    _root,
    params,
    { models, subdomain }: IContext
  ) => {
    const query = await generateFilterItems(params, subdomain);
    return models.SafeRemainderItems.find(query);
  },

  safeRemainderItemsCount: async (
    _root,
    params,
    { models, subdomain }: IContext
  ) => {
    const query = await generateFilterItems(params, subdomain);
    return models.SafeRemainderItems.find(query).count();
  }
};

requireLogin(safeRemainderQueries, 'tagDetail');
checkPermission(safeRemainderQueries, 'remainders', 'showTags', []);

export default safeRemainderQueries;
