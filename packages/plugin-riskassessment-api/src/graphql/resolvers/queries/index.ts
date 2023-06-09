import RiskFormSubmissionQueries from './formSubmissions';
import OperationQueries from './operations';
import RiskAssessmentQueries from './riskAssessments';
import RiskIndicatorQueries from './riskIndicators';
import RiskAssessmentPlanQueries from './plan';
export default {
  ...RiskIndicatorQueries,
  ...RiskAssessmentQueries,
  ...RiskFormSubmissionQueries,
  ...OperationQueries,
  ...RiskAssessmentPlanQueries
};
