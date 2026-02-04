import gql from "graphql-tag";

const commonParams = `
  $search: String,
  $customerIds: [String],
  $companyIds: [String],
  $assignedUserIds: [String],
  $labelIds: [String],
  $extraParams: JSON,
  $closeDateType: String,
  $assignedToMe: String,
  $branchIds: [String]
  $departmentIds: [String]
  $segment: String
  $segmentData:String
  $createdStartDate: Date
  $createdEndDate: Date
  $stateChangedStartDate: Date
  $stateChangedEndDate: Date
  $startDateStartDate: Date
  $startDateEndDate: Date
  $closeDateStartDate: Date
  $closeDateEndDate: Date
`;

const commonParamDefs = `
  search: $search,
  customerIds: $customerIds,
  companyIds: $companyIds,
  assignedUserIds: $assignedUserIds,
  labelIds: $labelIds,
  extraParams: $extraParams,
  closeDateType: $closeDateType,
  assignedToMe: $assignedToMe,
  branchIds:$branchIds
  departmentIds:$departmentIds
  segment: $segment
  segmentData:$segmentData
  createdStartDate: $createdStartDate
  createdEndDate: $createdEndDate
  stateChangedStartDate: $stateChangedStartDate
  stateChangedEndDate: $stateChangedEndDate
  startDateStartDate: $startDateStartDate
  startDateEndDate: $startDateEndDate
  closeDateStartDate: $closeDateStartDate
  closeDateEndDate: $closeDateEndDate
`;

const stageParams = `
  $isNotLost: Boolean,
  $isAll: Boolean,
  $pipelineId: String,
  ${commonParams}
`;

const stageParamDefs = `
  isNotLost: $isNotLost,
  isAll: $isAll,
  pipelineId: $pipelineId,
  ${commonParamDefs}
`;

const stageCommon = `
  _id
  name
  order
  unUsedAmount
  amount
  itemsTotalCount
  pipelineId
  code
  age
  defaultTick
  probability
  visibility
  status
  canMoveMemberIds
  canEditMemberIds
`;

const GET_STAGES = gql`
  query SalesStages(
    ${stageParams}
  ) {
    salesStages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
    }
  }
`;

const GET_STAGE_DETAIL = gql`
  query SalesStageDetail($_id: String!) {
    salesStageDetail(_id: $_id) {
      ${stageCommon}
    }
  }
`;

export {
  GET_STAGES,
  GET_STAGE_DETAIL,
  stageCommon,
  stageParams,
  stageParamDefs,
  commonParams,
  commonParamDefs,
};
