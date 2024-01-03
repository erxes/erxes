import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';

const commonParamsDef = `
  $isArchived:Boolean,
  $status:String,
  $plannerIds:[String],
  $structureIds:[String],
  $createDateFrom:String,
  $createDateTo:String,
  $startDateFrom:String,
  $startDateTo:String,
  $closeDateFrom:String,
  $closeDateTo:String,
  $createdAtFrom:String,
  $createdAtTo:String,
  $modifiedAtFrom:String,
  $modifiedAtTo:String,
  ${commonPaginateDef}
`;

const commonParamsValue = `
  isArchived:$isArchived,
  plannerIds:$plannerIds,
  structureIds:$structureIds,
  status:$status,
  createDateFrom:$createDateFrom,
  createDateTo:$createDateTo,
  startDateFrom:$startDateFrom,
  startDateTo:$startDateTo,
  closeDateFrom:$closeDateFrom,
  closeDateTo:$closeDateTo,
  createdAtFrom:$createdAtFrom,
  createdAtTo:$createdAtTo,
  modifiedAtFrom:$modifiedAtFrom,
  modifiedAtTo:$modifiedAtTo,
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
