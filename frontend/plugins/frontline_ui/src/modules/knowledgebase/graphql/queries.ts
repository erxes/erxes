import { gql } from '@apollo/client';
import { ATTACHMENT_FRAGMENT } from 'erxes-ui';

export const KB_AUTHOR_FIELDS = gql`
  fragment FrontlineKbAuthorFields on User {
    _id
    username
    email
    details {
      avatar
      fullName
    }
  }
`;

export const KB_CATEGORY_FIELDS = gql`
  fragment FrontlineKbCategoryFields on KnowledgeBaseCategory {
    _id
    title
    code
    description
    icon
    parentCategoryId
    numOfArticles
    createdDate
    modifiedDate
  }
`;

export const KB_TOPIC_FIELDS = gql`
  fragment FrontlineKbTopicFields on KnowledgeBaseTopic {
    _id
    title
    code
    description
    color
    backgroundImage
    languageCode
    notificationSegmentId
    createdBy
    createdDate
    modifiedBy
    modifiedDate
    brand {
      _id
      name
    }
  }
`;

export const KB_ARTICLE_FIELDS = gql`
  fragment FrontlineKbArticleFields on KnowledgeBaseArticle {
    _id
    code
    title
    summary
    status
    isPrivate
    viewCount
    topicId
    categoryId
    createdDate
    modifiedDate
    scheduledDate
  }
`;

export const TOPICS = gql`
  ${KB_TOPIC_FIELDS}
  ${KB_CATEGORY_FIELDS}
  query frontlineKbTopics(
    $page: Int
    $perPage: Int
    $searchValue: String
    $brandId: String
  ) {
    knowledgeBaseTopics(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
      brandId: $brandId
    ) {
      ...FrontlineKbTopicFields
      categories {
        ...FrontlineKbCategoryFields
      }
    }
    knowledgeBaseTopicsTotalCount
  }
`;

export const TOPIC_OPTIONS = gql`
  query frontlineKbTopicOptions($perPage: Int, $searchValue: String) {
    knowledgeBaseTopics(page: 1, perPage: $perPage, searchValue: $searchValue) {
      _id
      title
      code
    }
  }
`;

export const TOPIC_DETAIL = gql`
  ${KB_TOPIC_FIELDS}
  ${KB_CATEGORY_FIELDS}
  query frontlineKbTopicDetail($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      ...FrontlineKbTopicFields
      categories {
        ...FrontlineKbCategoryFields
      }
    }
  }
`;

export const CATEGORIES = gql`
  ${KB_CATEGORY_FIELDS}
  ${KB_AUTHOR_FIELDS}
  query frontlineKbCategories($topicIds: [String], $page: Int, $perPage: Int) {
    knowledgeBaseCategories(
      topicIds: $topicIds
      page: $page
      perPage: $perPage
    ) {
      ...FrontlineKbCategoryFields
      authors {
        ...FrontlineKbAuthorFields
      }
    }
    knowledgeBaseCategoriesTotalCount(topicIds: $topicIds)
  }
`;

export const ARTICLES = gql`
  ${KB_ARTICLE_FIELDS}
  ${KB_AUTHOR_FIELDS}
  query frontlineKbArticles(
    $topicIds: [String]
    $categoryIds: [String]
    $searchValue: String
    $status: String
    $page: Int
    $perPage: Int
  ) {
    knowledgeBaseArticles(
      topicIds: $topicIds
      categoryIds: $categoryIds
      searchValue: $searchValue
      status: $status
      page: $page
      perPage: $perPage
      sortField: "modifiedDate"
      sortDirection: -1
    ) {
      ...FrontlineKbArticleFields
      createdUser {
        ...FrontlineKbAuthorFields
      }
      publishedUser {
        ...FrontlineKbAuthorFields
      }
    }
    knowledgeBaseArticlesTotalCount(
      topicIds: $topicIds
      categoryIds: $categoryIds
      status: $status
    )
  }
`;

export const ARTICLE_DETAIL = gql`
  ${KB_ARTICLE_FIELDS}
  ${ATTACHMENT_FRAGMENT}
  query frontlineKbArticleDetail($_id: String!) {
    knowledgeBaseArticleDetail(_id: $_id) {
      ...FrontlineKbArticleFields
      content
      reactionChoices
      image {
        ...AttachmentFragment
      }
      attachments {
        ...AttachmentFragment
      }
      pdfAttachment {
        pdf {
          ...AttachmentFragment
        }
        pages {
          ...AttachmentFragment
        }
      }
    }
  }
`;

export const GET_KNOWLEDGE_BASE_TOPIC_DETAILS = gql`
  query frontlineKbTopicContent($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      _id
      title
      description
      color
      code
      categories {
        _id
        title
        description
        numOfArticles(status: "publish")
        countArticles
        parentCategoryId
        icon
        articles(status: "publish") {
          _id
          title
          summary
          content
          code
          status
          categoryId
          topicId
          viewCount
          isPrivate
          reactionCounts
          reactionChoices
          publishedAt
          modifiedDate
          image {
            url
            name
            type
            size
            duration
          }
          attachments {
            url
            name
            type
            size
            duration
          }
        }
      }
      parentCategories {
        _id
        title
        description
        numOfArticles(status: "publish")
        parentCategoryId
        icon
        childrens {
          _id
        }
        articles {
          _id
          title
          summary
          content
          code
          status
          categoryId
          topicId
          viewCount
          isPrivate
          reactionCounts
          reactionChoices
          publishedAt
          modifiedDate
          image {
            url
            name
            type
            size
            duration
          }
          attachments {
            url
            name
            type
            size
            duration
          }
        }
      }
    }
  }
`;
