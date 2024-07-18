import { queries as teamQueries } from "@erxes/ui/src/team/graphql";

const detailFields = teamQueries.detailFields;

const pipelineLabelFields = `
  _id
  name
  colorCode
  pipelineId
  createdBy
  createdAt
`;

const archivedStages = `
  query purchasesArchivedStages(
    $pipelineId: String!,
    $search: String,
    $page: Int,
    $perPage: Int,
  ) {
    purchasesArchivedStages(
      pipelineId: $pipelineId,
      search: $search,
      page: $page,
      perPage: $perPage,
    ) {
      _id
      name
    }
  }
`;

const boardGetLast = `
  query purchasesBoardGetLast($type: String!) {
    purchasesBoardGetLast(type: $type) {
      _id
      name
      pipelines {
        _id
        name
      }
    }
  }
`;

const boardDetail = `
  query purchasesBoardDetail($_id: String!) {
    purchasesBoardDetail(_id: $_id) {
      _id
      name
      pipelines {
        _id
        name
        visibility
        memberIds
        isWatched
        startDate
        endDate
        state
        itemsTotalCount
        members {
          _id
          email
          username
          details {
            avatar
            fullName
          }
        }
      }
    }
  }
`;

const archivedStagesCount = `
  query purchasesArchivedStagesCount(
    $pipelineId: String!,
    $search: String
  ) {
    purchasesArchivedStagesCount(
      pipelineId: $pipelineId,
      search: $search
    )
  }
`;

const pipelineAssignedUsers = `
  query purchasesPipelineAssignedUsers($_id: String!) {
    purchasesPipelineAssignedUsers(_id: $_id) {
      _id
      details {
        avatar
        fullName
      }
    }
  }
`;

const pipelineLabelDetail = `
  query purchasesPipelineLabelDetail($_id: String!) {
    purchasesPipelineLabelDetail(_id: $_id) {
      ${pipelineLabelFields}
    }
  }
`;

const boards = `
  query purchasesBoards($type: String!) {
    purchasesBoards(type: $type) {
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
  query purchasesPipelines($boardId: String, $type: String, $perPage: Int, $page: Int) {
    purchasesPipelines(boardId: $boardId, type: $type, perPage: $perPage, page: $page) {
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
  $pipelineId: String!,
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
`;

const stages = `
  query purchasesStages(
    ${stageParams}
  ) {
    purchasesStages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
    }
  }
`;

const pipelineLabels = `
  query purchasesPipelineLabels($pipelineId: String!) {
    purchasesPipelineLabels(pipelineId: $pipelineId) {
      ${pipelineLabelFields}
    }
  }
`;

const pipelineDetail = `
  query purchasesPipelineDetail($_id: String!) {
    purchasesPipelineDetail(_id: $_id) {
      _id
      name
      bgColor
      isWatched
      hackScoringType
      tagId
    }
  }
`;

const itemsCountBySegments = `
  query purchasesItemsCountBySegments($type: String!, $boardId: String, $pipelineId: String) {
    purchasesItemsCountBySegments(type: $type, boardId: $boardId, pipelineId: $pipelineId)
  }
`;

const stageDetail = `
  query purchasesStageDetail(
    $_id: String!,
    ${commonParams}
  ) {
    purchasesStageDetail(
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

const boardCounts = `
  query purchasesBoardCounts($type: String!) {
    purchasesBoardCounts(type: $type) {
      _id
      name
      count
    }
  }
`;

const itemsCountByAssignedUser = `
  query purchasesItemsCountByAssignedUser($pipelineId: String!, $type: String!, $stackBy: String) {
    purchasesItemsCountByAssignedUser(pipelineId: $pipelineId, type: $type, stackBy: $stackBy)
  }
`;

const commonLogParamDefs = `
  $contentType: String,
  $pipelineId: String,
  $perPage: Int,
  $page: Int,
`;

const commonLogParams = `
  contentType: $contentType,
  pipelineId: $pipelineId,
  perPage: $perPage,
  page: $page,
`;

const commonLogFields = `
  _id
  action
  content
  createdAt
  contentType
  contentTypeDetail
`;

const activityLogsByAction = `
  query activityLogsByAction($action: String, ${commonLogParamDefs}) {
    activityLogsByAction(action: $action, ${commonLogParams}
    ) {
      activityLogs {
        createdUser {
          _id
          username
          email

          details {
            ${detailFields}
          }
        }

        ${commonLogFields}
      }

      totalCount
    }
  }
`;

const internalNotesByAction = `
  query internalNotesByAction(${commonLogParamDefs}) {
    internalNotesByAction(${commonLogParams}) {
      list {
        ${commonLogFields}
      }
      totalCount
    }
  }
`;

const conversionStages = `
  query purchasesStages(
    ${stageParams}
  ) {
    purchasesStages(
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

const cardFields = `
  _id
  name
  customers
  companies
  assignedUsers
  startDate
  closeDate
  tagIds
`;

const boardItemQueryParamsDef = `
  $_ids: [String],
  $pipelineId: String,
  $stageId: String,
  $skip: Int,
  $limit: Int,
  $tagIds: [String],
  $searchValue: String,
`;

const boardItemQueryParams = `
  _ids: $_ids,
  pipelineId: $pipelineId,
  stageId: $stageId,
  skip: $skip,
  limit: $limit,
  tagIds: $tagIds,
  search: $searchValue,
`;

const purchases = `
  query purchases(${boardItemQueryParamsDef}) {
    purchases(${boardItemQueryParams}) {
      ${cardFields}
    }
  }
`;

const boardContentTypeDetail = `
  query purchasesBoardContentTypeDetail($contentType: String, $contentId: String){
    purchasesBoardContentTypeDetail(contentType: $contentType, contentId: $contentId)
  }
`;

const boardLogs = `
  query purchasesBoardLogs($action: String, $content: JSON, $contentType: String, $contentId: String){
    purchasesBoardLogs(action: $action, content: $content, contentType: $contentType, contentId: $contentId)
  }
`;

const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String, $subType: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType, subType: $subType) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

export default {
  archivedStages,
  archivedStagesCount,
  boards,
  boardDetail,
  boardGetLast,
  boardCounts,
  pipelines,
  commonParams,
  commonParamDefs,
  pipelineLabels,
  stageParams,
  stageParamDefs,
  stageCommon,
  stages,
  pipelineDetail,
  itemsCountBySegments,
  stageDetail,
  pipelineLabelDetail,
  itemsCountByAssignedUser,
  pipelineAssignedUsers,
  activityLogsByAction,
  conversionStages,
  internalNotesByAction,
  boardContentTypeDetail,
  boardLogs,
  documents,
  purchases
};
