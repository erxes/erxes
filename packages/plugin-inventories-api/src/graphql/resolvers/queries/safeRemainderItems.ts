import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

const generateFilterItems = async (subdomain: string, params: any) => {
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

const safeRemainderItemsQueries = {
  safeRemainderItems: async (
    _root: any,
    params: any,
    { models, subdomain }: IContext
  ) => {
    const query: any = await generateFilterItems(subdomain, params);
    return models.SafeRemainderItems.find(query);
  },

  safeRemainderItemsCount: async (
    _root: any,
    params: any,
    { models, subdomain }: IContext
  ) => {
    const query: any = await generateFilterItems(subdomain, params);
    return models.SafeRemainderItems.find(query).count();
  }
};

requireLogin(safeRemainderItemsQueries, 'tagDetail');
checkPermission(safeRemainderItemsQueries, 'remainders', 'showTags', []);

export default safeRemainderItemsQueries;
