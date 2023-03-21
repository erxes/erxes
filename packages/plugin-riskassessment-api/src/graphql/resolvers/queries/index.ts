import RiskFormSubmissionQueries from './formSubmissions';
import OperationQueries from './operations';
import RiskAssessmentQueries from './riskAssessments';
import RiskIndicatorQueries from './riskIndicators';
export default {
  ...RiskIndicatorQueries,
  ...RiskAssessmentQueries,
  ...RiskFormSubmissionQueries,
  ...OperationQueries
};
