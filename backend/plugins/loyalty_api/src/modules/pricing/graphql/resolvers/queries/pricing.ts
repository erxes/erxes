import { IContext } from '~/connectionResolvers';
import { pricingPlanQueries } from './pricingPlan';

export const pricingQueries = {
  getPricing: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Pricing.getPricing(_id);
  },
  
  getPricings: async (_parent: undefined, { models }: IContext) => {
    return models.Pricing.getPricings();
  },

  ...pricingPlanQueries
};