import dayLabelMutation from './dayLabels';
import labelsMutation from './labels';
import salesLogMutation from './salesplans';
import timeframeMutations from './timeframes';
import yearPlanMutation from './yearPlans';

export default {
  ...salesLogMutation,
  ...yearPlanMutation,
  ...dayLabelMutation,
  ...labelsMutation,
  ...timeframeMutations
};
