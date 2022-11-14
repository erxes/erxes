import salesLogMutation from './salesplans';
import yearPlanMutation from './yearPlans';
import labelsMutation from './labels';
import timeframeMutations from './timeframes';

export default {
  ...salesLogMutation,
  ...yearPlanMutation,
  ...labelsMutation,
  ...timeframeMutations
};
