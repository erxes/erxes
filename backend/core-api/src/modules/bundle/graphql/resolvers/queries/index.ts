import { bundleConditionQueries } from './bundleCondition';
import { bundleRuleQueries } from './bundleRule';

export const bundleQueries = {
  ...bundleRuleQueries,
  ...bundleConditionQueries,
};
