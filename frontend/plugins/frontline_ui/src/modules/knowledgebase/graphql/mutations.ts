import { gql } from '@apollo/client';

export const ADD_TOPIC = gql`
  mutation KnowledgeBaseTopicsAdd($doc: KnowledgeBaseTopicDoc!) {
  knowledgeBaseTopicsAdd(doc: $doc) {
    _id
    title
    description
  }
}
`;

export const EDIT_TOPIC = gql`
 mutation KnowledgeBaseTopicsEdit($_id: String!, $doc: KnowledgeBaseTopicDoc!) {
  knowledgeBaseTopicsEdit(_id: $_id, doc: $doc) {
    _id
    title
  }
}


`;

export const REMOVE_TOPIC = gql`
  mutation knowledgeBaseTopicsRemove($_id: String!) {
    knowledgeBaseTopicsRemove(_id: $_id)
  }
`;

export const ADD_CATEGORY = gql`
  mutation KnowledgeBaseCategoriesAdd($doc: KnowledgeBaseCategoryDoc!) {
  knowledgeBaseCategoriesAdd(doc: $doc) {
    _id    
  }
}
`;

export const EDIT_CATEGORY = gql`
  mutation KnowledgeBaseCategoriesEdit(
    $_id: String!, 
    $doc: KnowledgeBaseCategoryDoc!) {
    knowledgeBaseCategoriesEdit(_id: $_id, doc: $doc) 
  {
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
  mutation knowledgeBaseArticlesAdd($doc: KnowledgeBaseArticleDoc!) {
    knowledgeBaseArticlesAdd(doc: $doc) {
      _id
      title
    }
  }
`;

export const EDIT_ARTICLE = gql`
  mutation KnowledgeBaseArticlesEdit($_id: String!, $doc: KnowledgeBaseArticleDoc!) {
    knowledgeBaseArticlesEdit(_id: $_id, doc: $doc) {
      _id
      title
    }
   }
 `;

export const REMOVE_ARTICLE = gql`
  mutation knowledgeBaseArticlesRemove($_id: String!) {
    knowledgeBaseArticlesRemove(_id: $_id) 
  }
`;
