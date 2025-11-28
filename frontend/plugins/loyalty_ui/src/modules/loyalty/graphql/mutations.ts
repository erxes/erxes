import { gql } from '@apollo/client';

export const ADD_TOPIC = gql`
  mutation knowledgeBaseTopicsAdd($input: KnowledgeBaseTopicInput!) {
    knowledgeBaseTopicsAdd(input: $input) {
      _id
    }
  }
`;

export const EDIT_TOPIC = gql`
  mutation knowledgeBaseTopicsEdit(
    $_id: String!
    $input: KnowledgeBaseTopicInput!
  ) {
    knowledgeBaseTopicsEdit(_id: $_id, input: $input) {
      _id
    }
  }
`;

export const REMOVE_TOPIC = gql`
  mutation knowledgeBaseTopicsRemove($_id: String!) {
    knowledgeBaseTopicsRemove(_id: $_id)
  }
`;

export const ADD_CATEGORY = gql`
  mutation knowledgeBaseCategoriesAdd($input: KnowledgeBaseCategoryInput!) {
    knowledgeBaseCategoriesAdd(input: $input) {
      _id
    }
  }
`;

export const EDIT_CATEGORY = gql`
  mutation knowledgeBaseCategoriesEdit(
    $_id: String!
    $input: KnowledgeBaseCategoryInput!
  ) {
    knowledgeBaseCategoriesEdit(_id: $_id, input: $input) {
      _id
    }
  }
`;

export const REMOVE_CATEGORY = gql`
  mutation knowledgeBaseCategoriesRemove($_id: String!) {
    knowledgeBaseCategoriesRemove(_id: $_id)
  }
`;

export const ADD_ARTICLE = gql`
  mutation knowledgeBaseArticlesAdd($input: KnowledgeBaseArticleInput!) {
    knowledgeBaseArticlesAdd(input: $input) {
      _id
    }
  }
`;

export const EDIT_ARTICLE = gql`
  mutation knowledgeBaseArticlesEdit(
    $_id: String!
    $input: KnowledgeBaseArticleInput!
  ) {
    knowledgeBaseArticlesEdit(_id: $_id, input: $input) {
      _id
    }
  }
`;

export const REMOVE_ARTICLE = gql`
  mutation knowledgeBaseArticlesRemove($_id: String!) {
    knowledgeBaseArticlesRemove(_id: $_id) {
      _id
    }
  }
`;
