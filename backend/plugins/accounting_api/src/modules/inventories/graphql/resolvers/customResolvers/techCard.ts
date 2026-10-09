import { ITechCardItem } from '~/modules/inventories/@types/techCards';

export const TechCardItem = {
  product(item: ITechCardItem) {
    if (!item.productId) {
      return;
    }

    return {
      __typename: 'Product',
      _id: item.productId,
    };
  },
};
