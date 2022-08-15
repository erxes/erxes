import RiskAssessmentMutations from './riskAssessment';
import RiskAnswerMutations from './riskAnswer';
import RiskConfimityMutations from './riskConfimity';
import RiskAssessmentCategoryMutation from './riskAssessmentCategory';

export default { ...RiskAssessmentMutations, ...RiskAnswerMutations, ...RiskConfimityMutations, ...RiskAssessmentCategoryMutation };
