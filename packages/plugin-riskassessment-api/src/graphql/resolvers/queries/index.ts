import RiskAssessmentQueries from './riskAssessment';
import RiskConfimityQuries from './confirmity';
import RiskAssessmentsCategoryQueries from './category';
export default {
  ...RiskAssessmentQueries,
  ...RiskConfimityQuries,
  ...RiskAssessmentsCategoryQueries
};
