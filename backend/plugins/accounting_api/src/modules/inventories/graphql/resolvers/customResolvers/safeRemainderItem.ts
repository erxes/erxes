import { ISafeRemainderItemDocument } from '~/modules/inventories/@types/safeRemainderItems';
import { IContext } from '~/connectionResolvers';

export default {
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
