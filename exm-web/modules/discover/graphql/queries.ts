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

export default {
  clientPortalGetConfig,
  getKbTopicQuery,
  categoryDetailQuery,
  articleDetailQuery,
  articlesQuery,
}
