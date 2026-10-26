import { gql } from '~/gql';

export const GET_ARCHIVED_STAGES_COUNT = gql(`
  query SalesArchivedStagesCount($pipelineId: String!, $search: String) {
    salesArchivedStagesCount(pipelineId: $pipelineId, search: $search)
  }
`);

export const GET_STAGES = gql(`
  query salesDealStages(
    $isNotLost: Boolean
    $isAll: Boolean
    $pipelineId: String
    $search: String
    $customerId: String
    $companyId: String
    $assignedUserIds: [String]
    $labelIds: [String]
    $extraParams: JSON
    $closeDateType: String
    $assignedToMe: String
    $branchIds: [String]
    $departmentIds: [String]
    $segment: String
    $createdStartDate: Date
    $createdEndDate: Date
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDateStartDate: Date
    $startDateEndDate: Date
    $closeDateStartDate: Date
    $closeDateEndDate: Date
  ) {
    salesStages(
      isNotLost: $isNotLost
      isAll: $isAll
      pipelineId: $pipelineId
      search: $search
      customerId: $customerId
      companyId: $companyId
      assignedUserIds: $assignedUserIds
      labelIds: $labelIds
      extraParams: $extraParams
      closeDateType: $closeDateType
      assignedToMe: $assignedToMe
      branchIds: $branchIds
      departmentIds: $departmentIds
      segment: $segment
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      stateChangedStartDate: $stageChangedStartDate
      stateChangedEndDate: $stageChangedEndDate
      startDateStartDate: $startDateStartDate
      startDateEndDate: $startDateEndDate
      closeDateStartDate: $closeDateStartDate
      closeDateEndDate: $closeDateEndDate
    ) {
      _id
      name
      order
      unUsedAmount
      amount
      itemsTotalCount
      pipelineId
      type
      code
      age
      defaultTick
      probability
      visibility
      status
      canMoveMemberIds
      canEditMemberIds
      memberIds
      departmentIds
    }
  }
`);

export const GET_CONVERSION_STAGES = gql(`
  query salesDealConversionStages(
    $isNotLost: Boolean
    $isAll: Boolean
    $pipelineId: String
    $search: String
    $customerId: String
    $companyId: String
    $assignedUserIds: [String]
    $labelIds: [String]
    $extraParams: JSON
    $closeDateType: String
    $assignedToMe: String
    $branchIds: [String]
    $departmentIds: [String]
    $segment: String
    $createdStartDate: Date
    $createdEndDate: Date
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDateStartDate: Date
    $startDateEndDate: Date
    $closeDateStartDate: Date
    $closeDateEndDate: Date
  ) {
    salesStages(
      isNotLost: $isNotLost
      isAll: $isAll
      pipelineId: $pipelineId
      search: $search
      customerId: $customerId
      companyId: $companyId
      assignedUserIds: $assignedUserIds
      labelIds: $labelIds
      extraParams: $extraParams
      closeDateType: $closeDateType
      assignedToMe: $assignedToMe
      branchIds: $branchIds
      departmentIds: $departmentIds
      segment: $segment
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      stateChangedStartDate: $stageChangedStartDate
      stateChangedEndDate: $stageChangedEndDate
      startDateStartDate: $startDateStartDate
      startDateEndDate: $startDateEndDate
      closeDateStartDate: $closeDateStartDate
      closeDateEndDate: $closeDateEndDate
    ) {
      _id
      name
      order
      unUsedAmount
      amount
      itemsTotalCount
      pipelineId
      type
      code
      age
      defaultTick
      probability
      visibility
      status
      canMoveMemberIds
      canEditMemberIds
      memberIds
      departmentIds
      compareNextStage
      initialDealsTotalCount
      stayedDealsTotalCount
      inProcessDealsTotalCount
    }
  }
`);

export const GET_STAGE_DETAIL = gql(`
  query SalesStageDetail($_id: String!) {
    salesStageDetail(_id: $_id) {
      _id
      name
      order
      unUsedAmount
      amount
      itemsTotalCount
      pipelineId
      type
      code
      age
      defaultTick
      probability
      visibility
      status
      canMoveMemberIds
      canEditMemberIds
      memberIds
      departmentIds
    }
  }
`);
