import { ISafeRemainderItemDocument } from '~/modules/inventories/@types/safeRemainderItems';
import { IContext } from '~/connectionResolvers';

export default {
  trInfo(safeRemainderItem: ISafeRemainderItemDocument) {
    const storedActiveCost = safeRemainderItem.trInfo?.activeCost ?? 0;
    const activeCost = Math.max(
      0,
      safeRemainderItem.cost ?? storedActiveCost,
    );
    const storedTargetCost = safeRemainderItem.trInfo?.unitCost;
    const isCostExplicit =
      safeRemainderItem.trInfo?.isCostExplicit ??
      (storedTargetCost !== undefined && storedTargetCost !== storedActiveCost);
    const defaultTargetCost =
      activeCost === 0 && safeRemainderItem.count > safeRemainderItem.preCount
        ? (safeRemainderItem.count - safeRemainderItem.preCount) *
          (safeRemainderItem.trInfo?.lastIncomePrice ?? 0)
        : safeRemainderItem.preCount > 0
        ? (activeCost / safeRemainderItem.preCount) * safeRemainderItem.count
        : 0;

    return {
      ...safeRemainderItem.trInfo,
      activeCost,
      isCostExplicit,
      unitCost:
        isCostExplicit && storedTargetCost !== undefined
          ? Math.max(0, storedTargetCost)
          : defaultTargetCost,
    };
  },

  async preCount(
    safeRemainderItem: ISafeRemainderItemDocument,
    _args: unknown,
    { checkPermission }: IContext,
  ) {
    try {
      await checkPermission('viewSafeRemainderItemCounts');
      return safeRemainderItem.preCount;
    } catch {
      return 0;
    }
  },

  async product(safeRemainderItem: ISafeRemainderItemDocument) {
    if (!safeRemainderItem.productId) {
      return;
    }

    return {
      __typename: 'Product',
      _id: safeRemainderItem.productId,
    };
  },
};
