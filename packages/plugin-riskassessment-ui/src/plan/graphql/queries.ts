import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';

const commonParamsDef = `
  $isArchived:Boolean,
  ${commonPaginateDef}
`;

const commonParamsValue = `
  isArchived:$isArchived,
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
      structureTypeIds
      startDate
      endDate
      groupId
      indicatorId
      name
      status
`;

const planTypes = `
    _id
    name
    structureType
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
