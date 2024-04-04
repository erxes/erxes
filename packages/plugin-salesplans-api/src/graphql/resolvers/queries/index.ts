import dayLabelsQueries from './dayLabels';
import dayPlansQueries from './dayPlans';
import labelsQueries from './settings';
import timeProportionQueries from './timeProprotions';
import yearPlansQueries from './yearPlans';

export default {
  ...dayLabelsQueries,
  ...dayPlansQueries,
  ...labelsQueries,
  ...timeProportionQueries,
  ...yearPlansQueries
};
