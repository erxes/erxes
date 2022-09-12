import formSubmissionMutations from './formSubmissions';
import RiskAnswerMutations from './riskAnswer';
import RiskAssessmentMutations from './riskAssessment';
import RiskAssessmentCategoryMutation from './riskAssessmentCategory';
import RiskConfimityMutations from './riskConfimity';

export default {
  ...RiskAssessmentMutations,
  ...RiskAnswerMutations,
  ...RiskConfimityMutations,
  ...RiskAssessmentCategoryMutation,
  ...formSubmissionMutations,
};
