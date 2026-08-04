import { ISafeRemainderItemDocument } from '~/modules/inventories/@types/safeRemainderItems';

export default {
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
