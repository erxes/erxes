import { bundleConditionMutations } from './bundleCondition';
import { bundleRuleMutations } from './bundleRule';

export const bundleMutations = {
  ...bundleRuleMutations,
  ...bundleConditionMutations,
};
