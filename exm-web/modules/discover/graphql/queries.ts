import { gql } from "@apollo/client"
import { queries as teamQueries } from "common/team/graphql"

const detailFields = teamQueries.detailFields
const allUsers = teamQueries.allUsers
const users = teamQueries.users

const clientPortalGetConfig = gql`
  query clientPortalGetConfigByDomain {
    clientPortalGetConfigByDomain {
      _id
      name
      description
      logo
      icon
      headerHtml
      footerHtml
      url
      messengerBrandCode
      knowledgeBaseLabel
      knowledgeBaseTopicId
      taskLabel
      taskPublicPipelineId
      taskPublicBoardId
      taskPublicLabel
      taskPipelineId
      taskStageId
      dealLabel
      dealPipelineId
      dealStageId
      purchaseLabel
      purchasePipelineId
      purchaseStageId
      ticketLabel
      ticketStageId
      ticketPipelineId
      publicTaskToggle
      ticketToggle
      taskToggle
      dealToggle
      purchaseToggle
      kbToggle
      googleClientId
      facebookAppId
      erxesAppToken

      styles {
        bodyColor
        headerColor
        footerColor
        helpColor
        backgroundColor
        activeTabColor
        baseColor
        headingColor
        linkColor
        linkHoverColor
        baseFont
        headingFont
        dividerColor
        primaryBtnColor
        secondaryBtnColor
      }
    }
  }
`

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
        details {
          fullName
          avatar
        }
      }
    }
  }
`

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
`

const commonParamDefs = `
  search: $search,
  customerIds: $customerIds,
  companyIds: $companyIds,
  assignedUserIds: $assignedUserIds,
  labelIds: $labelIds,
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

const stageDetail = gql`
  query stageDetail(
    $_id: String!,
    ${commonParams}
  ) {
    stageDetail(
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
`

const stageParams = `
  $isNotLost: Boolean,
  $pipelineId: String!,
  ${commonParams}
`

const stageParamDefs = `
  isNotLost: $isNotLost,
  pipelineId: $pipelineId,
  ${commonParamDefs}
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
    ${commonParams}
  ) {
    tickets(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      limit: $limit,
      ${commonParamDefs}
    ) {
      ${commonListFields}
    }
  }
`

const ticketsTotalCount = `
  query ticketsTotalCount(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $search: String,
    ${commonParams}
  ) {
    ticketsTotalCount(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      search: $search,
      ${commonParamDefs}
    )
  }
`

export default {
  clientPortalGetConfig,
  getKbTopicQuery,
  categoryDetailQuery,
  articleDetailQuery,
  articlesQuery,
  stageDetail,
  stages,
  tickets,
}
