import { IContext } from '~/connectionResolvers';
import { pricingPlanMutations } from './pricingPlan';

export const pricingMutations = {

  createPricing: async (
    _parent: undefined,
    { name }: { name: string },
    { models }: IContext,
  ) => {
    return models.Pricing.createPricing({ name });
  },

  updatePricing: async (
    _parent: undefined,
    { _id, name }: { _id: string; name: string },
    { models }: IContext,
  ) => {
    return models.Pricing.updatePricing(_id, { name });
  },

  removePricing: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Pricing.removePricing(_id);
  },

  pricingPlanAdd: pricingPlanMutations.pricingPlanAdd,

  pricingPlanEdit: pricingPlanMutations.pricingPlanEdit,

  pricingPlanRemove: pricingPlanMutations.pricingPlanRemove,
};
