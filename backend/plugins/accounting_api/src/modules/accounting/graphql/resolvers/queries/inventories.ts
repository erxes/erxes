import { IContext } from '~/connectionResolvers';
import {
  activeCost,
  getLastIncomePrices,
} from '~/modules/accounting/utils/inventories';

const configQueries = {
  async getAccLastIncomePrice(
    _root,
    { productIds }: { productIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    return getLastIncomePrices(models, productIds || []);
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
    return await activeCost(
      models,
      accountId,
      branchId,
      departmentId,
      productIds,
      excludedTransactionIds,
    );
  },
};

export default configQueries;
