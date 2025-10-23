import { IContext } from "~/connectionResolvers";
import { JOURNALS } from "@/accounting/@types/constants";
import { activeCost } from "~/modules/accounting/utils/inventories";


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
    return await activeCost(models, accountId, branchId, departmentId, productIds);
  },
};

// moduleRequireLogin(configQueries);

export default configQueries;
