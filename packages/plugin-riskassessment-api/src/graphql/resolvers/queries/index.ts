import RiskAssessmentQueries from './riskAssessment';
import RiskConfimityQuries from './confirmity';
import RiskAssessmentsCategoryQueries from './category';
import RiskFormSubmissionQueries from './formSubmissions';
export default {
  ...RiskAssessmentQueries,
  ...RiskConfimityQuries,
  ...RiskAssessmentsCategoryQueries,
  ...RiskFormSubmissionQueries
};
