
  import { IContext } from '~/connectionResolvers';

  export const pricingMutations = {
    createPricing: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.Pricing.createPricing({name});
    },

    updatePricing: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.Pricing.updatePricing(_id, {name});
    },

    removePricing: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Pricing.removePricing(_id);
    },
  };

