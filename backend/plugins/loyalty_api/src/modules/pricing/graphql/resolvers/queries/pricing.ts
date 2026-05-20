import { IContext } from '~/connectionResolvers';
import { pricingPlanQueries } from './pricingPlan';

export const pricingQueries = {
  getPricing: async (_parent: undefined, { _id }: { _id: string }, { models, checkPermission }: IContext) => {
    await checkPermission('pricingView');
    return models.Pricing.getPricing(_id);
  },
  
  getPricings: async (_parent: undefined, _args: undefined, { models, checkPermission }: IContext) => {
    await checkPermission('pricingView');
    return models.Pricing.getPricings();
  },

  ...pricingPlanQueries
};