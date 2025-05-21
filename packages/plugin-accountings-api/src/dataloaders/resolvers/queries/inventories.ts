import { IContext } from '../../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { JOURNALS } from '../../../models/definitions/constants';

const configQueries = {
  async getAccLastIncomePrice(_root, { productIds }: { productIds: string[] }, { models }: IContext) {
    const aggByProductId = await models.Transactions.aggregate([
      {
        $match: { journal: JOURNALS.INV_INCOME, 'details.productId': { $in: productIds } }
      },
      { $unwind: '$details' },
      { $match: { 'details.productId': { $in: productIds } } },
      { $sort: { date: -1 } },
      { $group: { _id: 'details.productId', price: { $first: '$details.unitPrice' } } }
    ]);

    const result = {};
    for (const productIdPrice of aggByProductId) {
      result[productIdPrice._id] = productIdPrice.price
    }

    // { [productId: string]: number }
    return result;
  },

  async getAccCurrentCost(_root, {
    productIds, accountId, branchId, departmentId
  }: {
    productIds: string[], accountId: string, branchId: string, departmentId: string
  }, { models }: IContext) {
    const aggCosts = await models.AdjustInventories.aggregate([
      { $match: { accountId, branchId, departmentId } },
      { $sort: { date: -1 } },
      { $limit: 1 },
      { $unwind: '$details' },
      { $match: { 'details.productId': { $in: productIds } } },
      { $group: { _id: '$details.productId', cost: { $first: '$cost' } } }
    ]);

    const result = {};
    for (const productIdCost of aggCosts) {
      result[productIdCost._id] = productIdCost.cost;
    }

    // { [productId: string]: number }
    return result
  },
};

moduleRequireLogin(configQueries);

export default configQueries;
