import formSubmissionMutations from './formSubmissions';
import IndicatorMutations from './indicators';
import OperationMutations from './operation';
import RiskAssessmentMutations from './riskAssessments';

export default {
  ...IndicatorMutations,
  ...formSubmissionMutations,
  ...OperationMutations,
  ...RiskAssessmentMutations
};
