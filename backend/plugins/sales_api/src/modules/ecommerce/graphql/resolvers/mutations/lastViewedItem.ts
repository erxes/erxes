import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const lastViewedItemMutations: Record<string, Resolver> = {
  lastViewedItemAdd: async (
    _root,
    params,
    { models: { LastViewedItem } }: IContext,
  ) => {
    const { productId, customerId } = params;

    const added = await LastViewedItem.lastViewedItemAdd({
      productId,
      customerId,
    });

    return added;
  },
  lastViewedItemRemove: async (
    _root,
    params,
    { models: { LastViewedItem } }: IContext,
  ) => {
    const { _id } = params;
    const removed = await LastViewedItem.removeLastViewedItem(_id);
    return removed;
  },

  cpLastViewedItemAdd: async (
    _root,
    params,
    { models: { LastViewedItem } }: IContext,
  ) => {
    const { productId, customerId } = params;

    const added = await LastViewedItem.lastViewedItemAdd({
      productId,
      customerId,
    });

    return added;
  },

  cpLastViewedItemRemove: async (
    _root,
    params,
    { models: { LastViewedItem } }: IContext,
  ) => {
    const { _id } = params;
    const removed = await LastViewedItem.removeLastViewedItem(_id);
    return removed;
  },
};

export default lastViewedItemMutations;

lastViewedItemMutations.cpLastViewedItemAdd.wrapperConfig={
  forClientPortal:true,
}
lastViewedItemMutations.cpLastViewedItemRemove.wrapperConfig={
  forClientPortal:true,
}

