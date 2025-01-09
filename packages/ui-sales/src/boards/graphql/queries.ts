import { queries as teamQueries } from '@erxes/ui/src/team/graphql';

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
  query salesArchivedStages(
    $pipelineId: String!,
    $search: String,
    $page: Int,
    $perPage: Int,
  ) {
    salesArchivedStages(
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
  query salesBoardGetLast($type: String!) {
    salesBoardGetLast(type: $type) {
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
  query salesBoardDetail($_id: String!) {
    salesBoardDetail(_id: $_id) {
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
  query salesArchivedStagesCount(
    $pipelineId: String!,
    $search: String
  ) {
    salesArchivedStagesCount(
      pipelineId: $pipelineId,
      search: $search
    )
  }
`;

const pipelineAssignedUsers = `
  query salesPipelineAssignedUsers($_id: String!) {
    salesPipelineAssignedUsers(_id: $_id) {
      _id
      details {
        avatar
        fullName
      }
    }
  }
`;

const pipelineLabelDetail = `
  query salesPipelineLabelDetail($_id: String!) {
    salesPipelineLabelDetail(_id: $_id) {
      ${pipelineLabelFields}
    }
  }
`;

const boards = `
  query salesBoards($type: String!) {
    salesBoards(type: $type) {
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
  query salesPipelines($boardId: String, $type: String, $perPage: Int, $page: Int) {
    salesPipelines(boardId: $boardId, type: $type, perPage: $perPage, page: $page) {
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
  query salesStages(
    ${stageParams}
  ) {
    salesStages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
    }
  }
`;

const pipelineLabels = `
  query salesPipelineLabels($pipelineId: String!) {
    salesPipelineLabels(pipelineId: $pipelineId) {
      ${pipelineLabelFields}
    }
  }
`;

const pipelineDetail = `
  query salesPipelineDetail($_id: String!) {
    salesPipelineDetail(_id: $_id) {
      _id
      name
      bgColor
      isWatched
      hackScoringType
      tagId
      initialCategoryIds
      excludeCategoryIds
      excludeProductIds
      paymentIds
      paymentTypes
      erxesAppToken
    }
  }
`;

const itemsCountBySegments = `
  query salesItemsCountBySegments($type: String!, $boardId: String, $pipelineId: String) {
    salesItemsCountBySegments(type: $type, boardId: $boardId, pipelineId: $pipelineId)
  }
`;

const stageDetail = `
  query salesStageDetail(
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

const boardCounts = `
  query salesBoardCounts($type: String!) {
    salesBoardCounts(type: $type) {
      _id
      name
      count
    }
  }
`;

const itemsCountByAssignedUser = `
  query salesItemsCountByAssignedUser($pipelineId: String!, $type: String!, $stackBy: String) {
    salesItemsCountByAssignedUser(pipelineId: $pipelineId, type: $type, stackBy: $stackBy)
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
  query salesStages(
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

const deals = `
  query deals(${boardItemQueryParamsDef}) {
    deals(${boardItemQueryParams}) {
      ${cardFields}
    }
  }
`;

const boardContentTypeDetail = `
  query salesBoardContentTypeDetail($contentType: String, $contentId: String){
    salesBoardContentTypeDetail(contentType: $contentType, contentId: $contentId)
  }
`;

const boardLogs = `
  query salesBoardLogs($action: String, $content: JSON, $contentType: String, $contentId: String){
    salesBoardLogs(action: $action, content: $content, contentType: $contentType, contentId: $contentId)
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
  deals,
};
