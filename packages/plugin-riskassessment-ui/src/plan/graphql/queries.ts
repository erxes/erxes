import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';

const commonParamsDef = `
  $isArchived:Boolean,
  ${commonPaginateDef}
`;

const commonParamsValue = `
  isArchived:$isArchived,
  ${commonPaginateValue}
  `;

const commonUserFields = `
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
`;

const planTypes = `
      _id
      name
      structureType
      structureTypeId
      tagId
      configs
      createdAt
      modifiedAt
      createDate
      closeDate
      startDate
      status

      structureDetail {
        _id,
        title,
        order,
        code,
      }

      plannerId
      planner {
        ${commonUserFields}
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
          ${commonUserFields}
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
    ${planTypes},
    cardIds
    dashboard
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
