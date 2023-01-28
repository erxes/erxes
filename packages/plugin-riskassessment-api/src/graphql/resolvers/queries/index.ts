import RiskIndicatorQueries from './riskIndicators';
import RiskAssessmentQueries from './riskAssessments';
import RiskConfimityQuries from './confirmity';
import RiskAssessmentsCategoryQueries from './category';
import RiskFormSubmissionQueries from './formSubmissions';
import OperationQueries from './operations';
export default {
  ...RiskIndicatorQueries,
  ...RiskAssessmentQueries,
  ...RiskConfimityQuries,
  ...RiskAssessmentsCategoryQueries,
  ...RiskFormSubmissionQueries,
  ...OperationQueries
};
