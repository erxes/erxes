import dayLabelsQueries from './dayLabels';
import labelsQueries from './settings';
import query from './salesplans';
import yearPlansQueries from './yearPlans';
import dayPlansQueries from './dayPlans';

export default {
  ...query,
  ...dayLabelsQueries,
  ...labelsQueries,
  ...yearPlansQueries,
  ...dayPlansQueries
};
