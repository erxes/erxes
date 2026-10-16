import { IContext } from '~/connectionResolvers';
import {
  activeCost,
  getLastIncomePrices,
} from '~/modules/accounting/utils/inventories';
import { validateRequiredId } from '../../validateRequired';

const configQueries = {
  async getAccLastIncomePrice(
    _root,
    { productIds }: { productIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    for (const productId of productIds)
      validateRequiredId(productId, 'productIds');
    const prices = await getLastIncomePrices(models, productIds);
    return Object.entries(prices).map(([productId, unitPrice]) => ({
      productId,
      unitPrice,
    }));
  },

  async getAccCurrentCost(
    _root,
    {
      productIds,
      accountId,
      branchId,
      departmentId,
      excludedTransactionIds,
    }: {
      productIds: string[];
      accountId: string;
      branchId?: string;
      departmentId?: string;
      excludedTransactionIds?: string[];
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    validateRequiredId(accountId, 'accountId');
    for (const productId of productIds)
      validateRequiredId(productId, 'productIds');
    const costs = await activeCost(
      models,
      accountId,
      branchId,
      departmentId,
      productIds,
      excludedTransactionIds,
    );
    return Object.entries(costs).map(([productId, cost]) => ({
      productId,
      ...cost,
    }));
  },
};

export { configQueries };
