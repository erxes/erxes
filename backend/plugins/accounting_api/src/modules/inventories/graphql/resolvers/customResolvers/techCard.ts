import {
  ITechCard,
  ITechCardItem,
} from '~/modules/inventories/@types/techCards';

export const TechCard = {
  laborCosts: (card: ITechCard) => card.laborCosts ?? [],
  overheadCosts: (card: ITechCard) => card.overheadCosts ?? [],
};

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
