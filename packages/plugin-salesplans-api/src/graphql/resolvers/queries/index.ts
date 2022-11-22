import dayLabelsQueries from './dayLabels';
import labelsQueries from './settings';
import yearPlansQueries from './yearPlans';
import dayPlansQueries from './dayPlans';

export default {
  ...dayLabelsQueries,
  ...labelsQueries,
  ...yearPlansQueries,
  ...dayPlansQueries
};
