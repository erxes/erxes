import dayLabelMutation from './dayLabels';
import dayPlanMutation from './dayPlans';
import labelsMutation from './labels';
import timeframeMutations from './timeframes';
import timeProportionMutation from './timeProportions';
import yearPlanMutation from './yearPlans';

export default {
  ...dayLabelMutation,
  ...dayPlanMutation,
  ...labelsMutation,
  ...timeframeMutations,
  ...timeProportionMutation,
  ...yearPlanMutation
};
