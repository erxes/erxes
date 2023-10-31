import formSubmissionMutations from './formSubmissions';
import IndicatorMutations from './indicators';
import OperationMutations from './operation';
import PlansMutations from './plans';
import RiskAssessmentMutations from './riskAssessments';

export default {
  ...IndicatorMutations,
  ...formSubmissionMutations,
  ...OperationMutations,
  ...RiskAssessmentMutations,
  ...PlansMutations
};
