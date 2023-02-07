import formSubmissionMutations from './formSubmissions';
import IndicatorMutations from './indicators';
import RiskAssessmentCategoryMutation from './category';
import OperationMutations from './operation';
import RiskAssessmentMutations from './riskAssessments';

export default {
  ...IndicatorMutations,
  ...RiskAssessmentCategoryMutation,
  ...formSubmissionMutations,
  ...OperationMutations,
  ...RiskAssessmentMutations
};
