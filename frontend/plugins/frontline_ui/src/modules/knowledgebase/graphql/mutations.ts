import { gql } from '@apollo/client';

export const ADD_TOPIC = gql`
  mutation frontlineKbTopicAdd($doc: KnowledgeBaseTopicDoc!) {
    knowledgeBaseTopicsAdd(doc: $doc) {
      _id
      title
      description
    }
  }
`;

export const EDIT_TOPIC = gql`
  mutation frontlineKbTopicEdit($_id: String!, $doc: KnowledgeBaseTopicDoc!) {
    knowledgeBaseTopicsEdit(_id: $_id, doc: $doc) {
      _id
      title
      code
      description
      color
      backgroundImage
      languageCode
      notificationSegmentId
      brand {
        _id
        name
      }
    }
  }
`;

export const REMOVE_TOPIC = gql`
  mutation frontlineKbTopicRemove($_id: String!) {
    knowledgeBaseTopicsRemove(_id: $_id)
  }
`;

export const ADD_CATEGORY = gql`
  mutation frontlineKbCategoryAdd($doc: KnowledgeBaseCategoryDoc!) {
    knowledgeBaseCategoriesAdd(doc: $doc) {
      _id
      title
    }
  }
`;

export const EDIT_CATEGORY = gql`
  mutation frontlineKbCategoryEdit(
    $_id: String!
    $doc: KnowledgeBaseCategoryDoc!
  ) {
    knowledgeBaseCategoriesEdit(_id: $_id, doc: $doc) {
      _id
      title
      code
      description
      icon
      parentCategoryId
    }
  }
`;

export const REMOVE_CATEGORY = gql`
  mutation frontlineKbCategoryRemove($_id: String!) {
    knowledgeBaseCategoriesRemove(_id: $_id)
  }
`;

export const ADD_ARTICLE = gql`
  mutation frontlineKbArticleAdd($doc: KnowledgeBaseArticleDoc!) {
    knowledgeBaseArticlesAdd(doc: $doc) {
      _id
      title
    }
  }
`;

export const EDIT_ARTICLE = gql`
  mutation frontlineKbArticleEdit(
    $_id: String!
    $doc: KnowledgeBaseArticleDoc!
  ) {
    knowledgeBaseArticlesEdit(_id: $_id, doc: $doc) {
      _id
      title
      summary
      status
      isPrivate
      categoryId
      modifiedDate
    }
  }
`;

export const REMOVE_ARTICLE = gql`
  mutation frontlineKbArticleRemove($_id: String!) {
    knowledgeBaseArticlesRemove(_id: $_id)
  }
`;
