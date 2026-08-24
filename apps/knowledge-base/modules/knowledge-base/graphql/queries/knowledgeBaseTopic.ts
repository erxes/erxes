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

/**
 * Counts only — powers the home sections and the category sidebar without
 * pulling every article body.
 */
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

/**
 * Full tree with article bodies. `cpKnowledgeBaseTopicDetail` is the only
 * knowledge base query that skips the permission check, so article and search
 * pages read the articles through the topic rather than `knowledgeBaseArticles`.
 */
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
