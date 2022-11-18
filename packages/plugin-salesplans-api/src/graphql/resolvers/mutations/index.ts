import dayLabelMutation from './dayLabels';
import labelsMutation from './labels';
import timeframeMutations from './timeframes';
import yearPlanMutation from './yearPlans';
import dayPlanMutation from './dayPlans';

export default {
  ...yearPlanMutation,
  ...dayPlanMutation,
  ...dayLabelMutation,
  ...labelsMutation,
  ...timeframeMutations
};
