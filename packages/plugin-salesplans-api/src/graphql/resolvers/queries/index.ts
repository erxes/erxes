import query from './salesplans';
import labelsQueries from './settings';
import yearPlansQueries from './yearPlans';

export default {
  ...query,
  ...labelsQueries,
  ...yearPlansQueries
};
