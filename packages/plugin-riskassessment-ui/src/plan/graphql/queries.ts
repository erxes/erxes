import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';

const commonParamsDef = `
${commonPaginateDef}
`;

const commonParamsValue = `
${commonPaginateValue}
`;

const plans = `
query RiskAssessmentPlans(${commonParamsDef}) {
  riskAssessmentPlans(${commonParamsValue})
  riskAssessmentPlansTotalCount(${commonParamsValue})
}
`;

const totalCount = `
query RiskAssessmentPlansTotalCount(${commonParamsDef}) {
  riskAssessmentPlansTotalCount(${commonParamsValue})
}
`;

const plan = `
query RiskAssessmentPlan($_id: String) {
  riskAssessmentPlan(_id: $_id)
}
`;

export default {
  plans,
  totalCount,
  plan
};
