
  import { IContext } from '~/connectionResolvers';

   export const pricingQueries = {
    getPricing: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Pricing.getPricing(_id);
    },
    
    getPricings: async (_parent: undefined, { models }: IContext) => {
      return models.Pricing.getPricings();
    },
  };
