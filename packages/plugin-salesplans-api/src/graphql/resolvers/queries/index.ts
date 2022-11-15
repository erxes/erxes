import dayLabelsQueries from './dayLabels';
import labelsQueries from './settings';
import query from './salesplans';
import yearPlansQueries from './yearPlans';

export default {
  ...query,
  ...dayLabelsQueries,
  ...labelsQueries,
  ...yearPlansQueries
};
