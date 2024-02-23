import pricingPlanQueries from './pricingPlan';
import checkPricingQueries from './checkPricing';

export default {
  ...pricingPlanQueries,
  ...checkPricingQueries
};
