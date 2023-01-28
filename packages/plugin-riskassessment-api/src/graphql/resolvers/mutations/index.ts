import formSubmissionMutations from './formSubmissions';
import IndicatorMutations from './indicators';
import RiskAssessmentCategoryMutation from './category';
import RiskConfimityMutations from './confimity';
import OperationMutations from './operation';
import RiskAssessmentMutations from './riskAssessments';

export default {
  ...IndicatorMutations,
  ...RiskConfimityMutations,
  ...RiskAssessmentCategoryMutation,
  ...formSubmissionMutations,
  ...OperationMutations,
  ...RiskAssessmentMutations
};
