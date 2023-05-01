import { IContext } from '../../../connectionResolver';

const lastViewedItemMutations = {
  lastViewedItemAdd: async (
    _root,
    params,
    { models: { LastViewedItem } }: IContext
  ) => {
    const { productId, customerId } = params;

    const added = await LastViewedItem.lastViewedItemAdd({
      productId,
      customerId
    });

    return added;
  },
  lastViewedItemRemove: async (
    _root,
    params,
    { models: { LastViewedItem } }: IContext
  ) => {
    const { _id } = params;
    const removed = await LastViewedItem.removeLastViewedItem(_id);
    return removed;
  }
};

export default lastViewedItemMutations;
