import { gql } from '@apollo/client';

const CATEGORY_FIELDS = `
  _id
  title
  description
  icon
  numOfArticles(status: "publish")
  authors {
    _id
  }
`;

const ARTICLE_FIELDS = `
  _id
  title
  summary
  content
  categoryId
  viewCount
  createdDate
  modifiedDate
  publishedAt
  createdUser {
    _id
    details {
      fullName
      avatar
    }
  }
`;

export const KB_PORTAL_TOPIC_OVERVIEW = gql`
  query kbPortalTopicOverview($topicId: String!) {
    cpKnowledgeBaseTopicDetail(_id: $topicId) {
      _id
      title
      description
      color
      parentCategories {
        ${CATEGORY_FIELDS}
        childrens {
          ${CATEGORY_FIELDS}
        }
      }
    }
  }
`;

const ARTICLE_LIST_FIELDS = `
  _id
  title
  summary
  categoryId
  viewCount
  createdDate
  modifiedDate
  publishedAt
  createdUser {
    _id
    details {
      fullName
      avatar
    }
  }
`;

export const KB_PORTAL_TOPIC_ARTICLE_LIST = gql`
  query kbPortalTopicArticleList($topicId: String!) {
    cpKnowledgeBaseTopicDetail(_id: $topicId) {
      _id
      title
      description
      color
      parentCategories {
        ${CATEGORY_FIELDS}
        articles {
          ${ARTICLE_LIST_FIELDS}
        }
        childrens {
          ${CATEGORY_FIELDS}
          articles(status: "publish") {
            ${ARTICLE_LIST_FIELDS}
          }
        }
      }
    }
  }
`;

export const KB_PORTAL_TOPIC_ARTICLES = gql`
  query kbPortalTopicArticles($topicId: String!) {
    cpKnowledgeBaseTopicDetail(_id: $topicId) {
      _id
      title
      description
      color
      parentCategories {
        ${CATEGORY_FIELDS}
        articles {
          ${ARTICLE_FIELDS}
        }
        childrens {
          ${CATEGORY_FIELDS}
          articles(status: "publish") {
            ${ARTICLE_FIELDS}
          }
        }
      }
    }
  }
`;
