import RiskIndicatorQueries from './riskIndicators';
import RiskAssessmentQueries from './riskAssessments';
import RiskAssessmentsCategoryQueries from './category';
import RiskFormSubmissionQueries from './formSubmissions';
import OperationQueries from './operations';
export default {
  ...RiskIndicatorQueries,
  ...RiskAssessmentQueries,
  ...RiskAssessmentsCategoryQueries,
  ...RiskFormSubmissionQueries,
  ...OperationQueries
};
