import dayLabelMutation from './dayLabels';
import labelsMutation from './labels';
import salesLogMutation from './salesplans';
import timeframeMutations from './timeframes';
import yearPlanMutation from './yearPlans';
import dayPlanMutation from './dayPlans';

export default {
  ...salesLogMutation,
  ...yearPlanMutation,
  ...dayPlanMutation,
  ...dayLabelMutation,
  ...labelsMutation,
  ...timeframeMutations
};
