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

const ARTICLE_LIST_FIELDS = `
  _id
  title
  summary
  status
  isPrivate
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
const ARTICLE_FIELDS = `
  ${ARTICLE_LIST_FIELDS}
  content
`;

const topicWithArticles = (articleFields: string) => `
  cpKnowledgeBaseTopicDetail(_id: $topicId) {
    _id
    title
    description
    color
    parentCategories {
      ${CATEGORY_FIELDS}
      articles {
        ${articleFields}
      }
      childrens {
        ${CATEGORY_FIELDS}
        articles(status: "publish") {
          ${articleFields}
        }
      }
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

export const KB_PORTAL_TOPIC_ARTICLE_LIST = gql`
  query kbPortalTopicArticleList($topicId: String!) {
    ${topicWithArticles(ARTICLE_LIST_FIELDS)}
  }
`;

export const KB_PORTAL_TOPIC_ARTICLES = gql`
  query kbPortalTopicArticles($topicId: String!) {
    ${topicWithArticles(ARTICLE_FIELDS)}
  }
`;
