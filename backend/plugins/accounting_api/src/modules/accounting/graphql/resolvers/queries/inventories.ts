import { IContext } from "~/connectionResolvers";
import { JOURNALS } from "@/accounting/@types/constants";


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
    const aggCosts = await models.AdjustInvDetails.aggregate([
      { $match: { accountId, branchId, departmentId, productId: { $in: productIds || [] } } },
    ]);

    const result = {};
    for (const detail of aggCosts) {
      result[detail.productId] = { totalCost: detail.cost, unitCost: detail.unitCost, remainder: detail.remainder };
    }

    return result
  },
};

// moduleRequireLogin(configQueries);

export default configQueries;
