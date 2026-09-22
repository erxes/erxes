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

const TOPIC_SETTINGS_FIELDS = `
  url
  kbToggle
  kbLabel
  kbTopicId
  ticketToggle
  ticketLabel
  ticketChannelId
  ticketPipelineId
  ticketStatusId
  styles {
    mainLogo
    favicon
    bodyColor
    headerColor
    footerColor
    helpCenterColor
    backgroundColor
    activeTabColor
    baseFont
    baseColor
    headingFont
    headingColor
    linkColor
    linkHoverColor
    primaryButtonColor
    secondaryButtonColor
    dividerColor
    headerHtml
    footerHtml
  }
`;

const topicWithArticles = (articleFields: string, settings: string) => `
  cpKnowledgeBaseTopicDetail(_id: $topicId) {
    _id
    title
    description
    color
    backgroundImage
    ${settings}
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

const overview = (settings: string) => `
  cpKnowledgeBaseTopicDetail(_id: $topicId) {
    _id
    title
    description
    color
    backgroundImage
    ${settings}
    parentCategories {
      ${CATEGORY_FIELDS}
      childrens {
        ${CATEGORY_FIELDS}
      }
    }
  }
`;

export const KB_PORTAL_TOPIC_OVERVIEW = gql`
  query kbPortalTopicOverview($topicId: String!) {
    ${overview(TOPIC_SETTINGS_FIELDS)}
  }
`;

export const KB_PORTAL_TOPIC_OVERVIEW_PLAIN = gql`
  query kbPortalTopicOverviewPlain($topicId: String!) {
    ${overview('')}
  }
`;

export const KB_PORTAL_TOPIC_ARTICLE_LIST = gql`
  query kbPortalTopicArticleList($topicId: String!) {
    ${topicWithArticles(ARTICLE_LIST_FIELDS, TOPIC_SETTINGS_FIELDS)}
  }
`;

export const KB_PORTAL_TOPIC_ARTICLE_LIST_PLAIN = gql`
  query kbPortalTopicArticleListPlain($topicId: String!) {
    ${topicWithArticles(ARTICLE_LIST_FIELDS, '')}
  }
`;

export const KB_PORTAL_TOPIC_ARTICLES = gql`
  query kbPortalTopicArticles($topicId: String!) {
    ${topicWithArticles(ARTICLE_FIELDS, TOPIC_SETTINGS_FIELDS)}
  }
`;

export const KB_PORTAL_TOPIC_ARTICLES_PLAIN = gql`
  query kbPortalTopicArticlesPlain($topicId: String!) {
    ${topicWithArticles(ARTICLE_FIELDS, '')}
  }
`;
