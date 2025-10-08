
  import { IContext } from '~/connectionResolvers';

  export const loyaltyMutations = {
    createLoyalty: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.Loyalty.createLoyalty({name});
    },

    updateLoyalty: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.Loyalty.updateLoyalty(_id, {name});
    },

    removeLoyalty: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Loyalty.removeLoyalty(_id);
    },
  };

