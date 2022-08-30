import RiskAssessmentQueries from './riskAssessment';
import RiskConfimityQuries from './riskConfirmity';
import RiskAnswerQueries from './riskAnswer';
import RiskAssesmentsCategoryQueries from './riskAssessmentCategory';
export default {
  ...RiskAssessmentQueries,
  ...RiskConfimityQuries,
  ...RiskAnswerQueries,
  ...RiskAssesmentsCategoryQueries,
};
