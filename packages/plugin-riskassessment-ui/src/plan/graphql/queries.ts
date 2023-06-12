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

const scheduleTypes = `
      _id
      customFieldsData
      assignedUserIds
      date
      groupId
      indicatorId
      name
`;

const planTypes = `
    _id
    name
    structureType
    structureTypeIds
    configs
    createdAt
    modifiedAt
`;

const plan = `
query RiskAssessmentPlan($_id: String) {
  riskAssessmentPlan(_id: $_id) {
    ${planTypes},
    schedules {
      ${scheduleTypes}
    }
  }
}
`;

export default {
  plans,
  totalCount,
  plan
};
