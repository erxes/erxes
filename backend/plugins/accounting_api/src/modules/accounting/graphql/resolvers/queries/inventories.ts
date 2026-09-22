import { IContext } from '~/connectionResolvers';
import { JOURNALS, TR_STATUSES } from '@/accounting/@types/constants';
import { activeCost } from '~/modules/accounting/utils/inventories';

const configQueries = {
  async getAccLastIncomePrice(
    _root,
    { productIds }: { productIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    const safeProductIds = productIds || [];
    const result: Record<string, number> = {};
    for (const productId of safeProductIds) {
      result[productId] = 0;
    }

    const aggByProductId = await models.Transactions.aggregate([
      {
        $match: {
          journal: JOURNALS.INV_INCOME,
          status: { $in: TR_STATUSES.ACTIVE },
          'details.productId': { $in: safeProductIds },
        },
      },
      { $unwind: '$details' },
      { $match: { 'details.productId': { $in: safeProductIds } } },
      { $sort: { date: -1, createdAt: -1, _id: -1 } },
      {
        $group: {
          _id: '$details.productId',
          price: { $first: '$details.unitPrice' },
        },
      },
    ]);

    for (const productIdPrice of aggByProductId) {
      result[productIdPrice._id] = productIdPrice.price || 0;
    }

    // { [productId: string]: number }
    return result;
  },

  async getAccCurrentCost(
    _root,
    {
      productIds,
      accountId,
      branchId,
      departmentId,
    }: {
      productIds: string[];
      accountId: string;
      branchId?: string;
      departmentId?: string;
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    return await activeCost(
      models,
      accountId,
      branchId,
      departmentId,
      productIds,
    );
  },
};

export default configQueries;
