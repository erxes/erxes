import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

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

      const items = await models.SafeRemItems.find({
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

  safeRemItems: async (_root, params, { models, subdomain }: IContext) => {
    const { remainderId, productCategoryId, statuses } = params;
    const query: any = { remainderId };
    if (productCategoryId) {
      const productCategories = await sendProductsMessage({
        subdomain,
        action: 'categories.withChilds',
        data: {
          _id: params.categoryId
        },
        isRPC: true,
        defaultValue: []
      });

      const productCategoryIds = productCategories.map(p => p._id);

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: { query: { categoryId: { $in: productCategoryIds } } },
        isRPC: true,
        defaultValue: []
      });

      const productIds = products.map(p => p._id);
      query.productId = { $in: productIds };
    }

    return models.SafeRemItems.find(query);
  }
};

requireLogin(safeRemainderQueries, 'tagDetail');
checkPermission(safeRemainderQueries, 'remainders', 'showTags', []);

export default safeRemainderQueries;
