import { gql } from "@apollo/client"

import { commonFields, ticketFields } from "./mutations"

const categoryFields = `
  _id
  title
  description
  icon
  numOfArticles
  authors {
    _id
    details {
      fullName
      avatar
    }
  }
`

const getKbTopicQuery = gql`
  query knowledgeBaseTopicDetail($_id: String!) {
    clientPortalKnowledgeBaseTopicDetail(_id: $_id) {
      _id
      title
      description
      color
      backgroundImage
      languageCode

      categories {
        ${categoryFields}
      }
      
      parentCategories {
        ${categoryFields}
        childrens {
          ${categoryFields}
        }
        articles{
          _id
          title        
        }
      }
    }
  }
`

const categoryDetailQuery = gql`
  query knowledgeBaseCategoryDetail($_id: String!) {
    knowledgeBaseCategoryDetail(_id: $_id) {
      _id
      title
      description
      numOfArticles
      icon
      authors {
        details {
          fullName
          avatar
        }
      }
      articles {
        _id
        title
        summary
        content
        reactionChoices
        createdBy
        createdDate
        modifiedBy
        modifiedDate
        categoryId
        createdUser {
          details {
            fullName
            avatar
          }
        }
      }
    }
  }
`

const articleDetailQuery = gql`
  query knowledgeBaseArticleDetail($_id: String!) {
    knowledgeBaseArticleDetail(_id: $_id) {
      _id
      title
      viewCount
      summary
      content
      status
      forms {
        brandId
        formId
      }
      reactionChoices
      reactionCounts
      createdBy
      createdUser {
        _id
        details {
          fullName
          avatar
        }
      }
      categoryId
      createdDate
      modifiedBy
      modifiedDate
    }
  }
`

export const articlesQuery = gql`
  query knowledgeBaseArticles(
    $categoryIds: [String]
    $searchValue: String
    $topicId: String
  ) {
    clientPortalKnowledgeBaseArticles(
      categoryIds: $categoryIds
      searchValue: $searchValue
      topicId: $topicId
    ) {
      _id
      title
      viewCount
      summary
      content
      status
      forms {
        brandId
        formId
      }
      reactionChoices
      reactionCounts
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      categoryId
      createdUser {
        _id
        details {
          fullName
          avatar
        }
      }
    }
  }
`

const ticketsCommonParams = `
  $page: Int,
  $perPage: Int,
  $companyIds: [String],
  $parentId: String,
  $customerIds: [String],
  $assignedUserIds: [String],
  $closeDateType: String,
  $priority: [String],
  $source: [String],
  $labelIds: [String],
  $sortField: String,
  $sortDirection: Int,
  $userIds: [String],
  $segment: String,
  $segmentData:String,
  $assignedToMe: String,
  $startDate: String,
  $endDate: String,
  $noSkipArchive: Boolean,
  $branchIds:[String]
  $departmentIds:[String]
  $createdStartDate: Date
  $createdEndDate: Date
  $stateChangedStartDate: Date
  $stateChangedEndDate: Date
  $startDateStartDate: Date
  $startDateEndDate: Date
  $closeDateStartDate: Date
  $closeDateEndDate: Date
`

const ticketsCommonParamDefs = `
  page: $page,
  perPage : $perPage,
  companyIds: $companyIds,
  customerIds: $customerIds,
  parentId: $parentId,
  assignedUserIds: $assignedUserIds,
  closeDateType: $closeDateType,
  priority: $priority,
  source: $source,
  labelIds: $labelIds,
  sortField: $sortField,
  sortDirection: $sortDirection,
  userIds: $userIds,
  segment: $segment,
  segmentData: $segmentData,
  assignedToMe: $assignedToMe,
  startDate: $startDate,
  endDate: $endDate,
  noSkipArchive: $noSkipArchive,
  branchIds: $branchIds,
  departmentIds: $departmentIds,
  createdStartDate: $createdStartDate
  createdEndDate: $createdEndDate
  stateChangedStartDate: $stateChangedStartDate
  stateChangedEndDate: $stateChangedEndDate
  startDateStartDate: $startDateStartDate
  startDateEndDate: $startDateEndDate
  closeDateStartDate: $closeDateStartDate
  closeDateEndDate: $closeDateEndDate
`

const commonListFields = `
  _id
  name
  assignedUsers
  labels
  stage
  isComplete
  isWatched
  relations
  startDate
  closeDate
  createdAt
  modifiedAt
  priority
  hasNotified
  score
  number
  tagIds
  customProperties
  status
`

const stagesCommonParams = `
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
`

const stagesCommonParamDefs = `
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
`

const stageParams = `
  $isNotLost: Boolean,
  $pipelineId: String!,
  ${stagesCommonParams}
`

const stageParamDefs = `
  isNotLost: $isNotLost,
  pipelineId: $pipelineId,
  ${stagesCommonParamDefs}
`

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
`

const stages = gql`
  query stages(
    ${stageParams}
  ) {
    stages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
    }
  }
`

const tickets = gql`
  query tickets(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $limit: Int,
    ${ticketsCommonParams}
  ) {
    tickets(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      limit: $limit,
      ${ticketsCommonParamDefs}
    ) {
      ${commonListFields}
    }
  }
`

const ticketDetail = gql`
  query ticketDetail($_id: String!) {
    ticketDetail(_id: $_id) {
      ${ticketFields}
      ${commonFields}
    }
  }
`

const ticketsTotalCount = gql`
  query ticketsTotalCount(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $search: String,
    ${ticketsCommonParams}
  ) {
    ticketsTotalCount(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      search: $search,
      ${ticketsCommonParamDefs}
    )
  }
`

export default {
  getKbTopicQuery,
  categoryDetailQuery,
  articleDetailQuery,
  articlesQuery,
  stages,
  tickets,
  ticketDetail,
  ticketsTotalCount,
}
