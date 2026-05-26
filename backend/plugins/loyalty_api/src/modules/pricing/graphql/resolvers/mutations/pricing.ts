import { IContext } from '~/connectionResolvers';
import { pricingFixedValueMutations } from './pricingFixedValue';
import { pricingPlanMutations } from './pricingPlan';

export const pricingMutations = {

  createPricing: async (
    _parent: undefined,
    { name }: { name: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingCreate');
    return models.Pricing.createPricing({ name });
  },

  updatePricing: async (
    _parent: undefined,
    { _id, name }: { _id: string; name: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingUpdate');
    return models.Pricing.updatePricing(_id, { name });
  },

  removePricing: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingRemove');
    return models.Pricing.removePricing(_id);
  },

  pricingPlanAdd: pricingPlanMutations.pricingPlanAdd,
  pricingPlanEdit: pricingPlanMutations.pricingPlanEdit,
  pricingPlanRemove: pricingPlanMutations.pricingPlanRemove,

  pricingFixedValueAdd: pricingFixedValueMutations.pricingFixedValueAdd,
  pricingFixedValueEdit: pricingFixedValueMutations.pricingFixedValueEdit,
  pricingFixedValueRemove: pricingFixedValueMutations.pricingFixedValueRemove,
};