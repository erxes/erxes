import formSubmissionMutations from './formSubmissions';
import RiskAssessmentMutations from './riskAssessment';
import RiskAssessmentCategoryMutation from './category';
import RiskConfimityMutations from './confimity';

export default {
  ...RiskAssessmentMutations,
  ...RiskConfimityMutations,
  ...RiskAssessmentCategoryMutation,
  ...formSubmissionMutations
};
