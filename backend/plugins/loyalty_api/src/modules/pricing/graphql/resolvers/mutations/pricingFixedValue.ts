import type { IContext } from '~/connectionResolvers';
import type { IPricingFixedValue } from '../../../@types/pricingFixedValue';

export const pricingFixedValueMutations = {
  pricingFixedValueAdd: async (
    _root: any,
    { pricingPlanId, doc }: { pricingPlanId: string; doc: IPricingFixedValue },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanCreate');
    return models.PricingFixedValues.createFixedValue(
      { ...doc, pricingPlanId },
      user._id,
    );
  },

  pricingFixedValueEdit: async (
    _root: any,
    { id, doc }: { id: string; doc: Partial<IPricingFixedValue> },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanUpdate');
    return models.PricingFixedValues.updateFixedValue(id, doc, user._id);
  },

  pricingFixedValueRemove: async (
    _root: any,
    { id }: { id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanRemove');
    return models.PricingFixedValues.removeFixedValue(id);
  },
};
