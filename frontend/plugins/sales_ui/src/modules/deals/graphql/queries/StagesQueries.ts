import { gql } from "@apollo/client";

export const commonParams = `
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

export const commonParamDefs = `
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
  $pipelineId: String,
  ${commonParams}
`;

const stageParamDefs = `
  isNotLost: $isNotLost,
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

export const GET_ARCHIVED_STAGES_COUNT = gql`
  query SalesArchivedStagesCount(
    $pipelineId: String!,
    $search: String
  ) {
    salesArchivedStagesCount(
      pipelineId: $pipelineId,
      search: $search
    )
  }
`;

export const GET_STAGES = gql`
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

export const GET_STAGE_DETAIL = gql`
  query SalesStageDetail(
    $_id: String!,
    ${commonParams}
  ) {
    salesStageDetail(
      _id: $_id,
      ${commonParamDefs}
    ) {
      _id
      name
      pipelineId
      amount
      itemsTotalCount
    }
  }
`;

export const GET_CONVERSION_STAGES = gql`
  query SalesStages(
    ${stageParams}
  ) {
    salesStages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
      compareNextStagePurchase
      initialPurchasesTotalCount
      stayedPurchasesTotalCount
      inProcessPurchasesTotalCount
    }
  }
`;