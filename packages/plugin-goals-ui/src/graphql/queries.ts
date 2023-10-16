const insuranceTypeFields = `
  _id
      entity
      contributionType
      chooseBoard 
      frequency
      metric
      goalType
      contribution
      startDate
      endDate
      target
`;

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
const stageParams = `
  $isNotLost: Boolean,
  $pipelineId: String!,
  ${commonParams}
`;
const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $searchValue: String
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const goalTypes = `
  query goalTypes(${listParamsDef}) {
    goalTypes(${listParamsValue}) {
      ${insuranceTypeFields}
    }
  }
`;

export const goalTypesMain = `
  query goalTypesMain(${listParamsDef}) {
    goalTypesMain(${listParamsValue}) {
      list {
        ${insuranceTypeFields}
      }

      totalCount
    }
  }
`;

export const goalTypeCounts = `
  query goalTypeCounts(${listParamsDef}, $only: String) {
    goalTypeCounts(${listParamsValue}, only: $only)
  }
`;

export const goalTypeDetail = `
  query goalTypeDetail($_id: String!) {
    goalTypeDetail(_id: $_id) {
      ${insuranceTypeFields}
    }
  }
`;
const boards = `
  query boards($type: String!) {
    boards(type: $type) {
      _id
      name

      pipelines {
        _id
        name
      }
    }
  }
`;
const pipelines = `
  query pipelines($boardId: String, $type: String, $perPage: Int, $page: Int) {
    pipelines(boardId: $boardId, type: $type, perPage: $perPage, page: $page) {
      _id
      name
      boardId
      state
      startDate
      endDate
      itemsTotalCount
    }
  }
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
`;
const stages = `
  query stages(
    ${stageParams}
  ) {
    stages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
    }
  }
`;
export default {
  goalTypes,
  goalTypesMain,
  goalTypeCounts,
  goalTypeDetail,
  boards,
  pipelines,
  stages
};
