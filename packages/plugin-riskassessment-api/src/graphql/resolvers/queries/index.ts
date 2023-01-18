import RiskAssessmentQueries from './riskAssessment';
import RiskConfimityQuries from './confirmity';
import RiskAssessmentsCategoryQueries from './category';
import RiskFormSubmissionQueries from './formSubmissions';
import OperationQueries from './operations';
export default {
  ...RiskAssessmentQueries,
  ...RiskConfimityQuries,
  ...RiskAssessmentsCategoryQueries,
  ...RiskFormSubmissionQueries,
  ...OperationQueries
};
