import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';

const commonParamsDef = `
  $isArchived:Boolean,
  ${commonPaginateDef}
`;

const commonParamsValue = `
  isArchived:$isArchived,
  ${commonPaginateValue}
  `;
const planTypes = `
      _id
      name
      structureType
      structureTypeId
      configs
      createdAt
      modifiedAt
      createDate
      closeDate
      startDate
      structureDetail {
      _id,
      title,
      order,
      code,
      }
  `;
const scheduleTypes = `
        _id
        customFieldsData
        assignedUserIds
        structureTypeId
        groupId
        indicatorId
        name
        status
        createdAt

        assignedUsers {
          _id
          email
          username
          isActive
          details {
            avatar
            firstName
            fullName
            lastName
          }
        }
  `;

const plans = `
query RiskAssessmentPlans(${commonParamsDef}) {
  riskAssessmentPlans(${commonParamsValue}){
    ${planTypes}
  }
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
  riskAssessmentPlan(_id: $_id) {
    ${planTypes}
  }
}
`;

const schedules = `
  query RiskAssessmentSchedules($planId: String) {
    riskAssessmentSchedules(planId: $planId){
      ${scheduleTypes}
    }
  }
`;

export default {
  plans,
  totalCount,
  plan,
  schedules
};
