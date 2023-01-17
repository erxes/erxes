import {
  IPricingPlan,
  IPricingPlanDocument
} from '../../../models/definitions/pricingPlan';

const PricingPlan = {
  createdUser(pricingPlan: IPricingPlanDocument) {
    if (!pricingPlan.createdBy) return;

    return {
      __typename: 'User',
      _id: pricingPlan.createdBy
    };
  },

  updatedUser(pricingPlan: IPricingPlanDocument) {
    if (!pricingPlan.updatedBy) return;

    return {
      __typename: 'User',
      _id: pricingPlan.updatedBy
    };
  }
};

export { PricingPlan };
