import { gql } from '@apollo/client';

export const FRONTLINE_AI_KNOWLEDGE_ARTICLES = gql`
  query frontlineAiKnowledgeArticles(
    $searchValue: String
    $page: Int
    $perPage: Int
    $status: String
  ) {
    knowledgeBaseArticles(
      searchValue: $searchValue
      page: $page
      perPage: $perPage
      status: $status
      sortField: "modifiedDate"
      sortDirection: -1
    ) {
      _id
      code
      title
      summary
      status
    }
  }
`;

export const FRONTLINE_AI_KNOWLEDGE_TOPICS = gql`
  query frontlineAiKnowledgeTopics($perPage: Int) {
    knowledgeBaseTopics(page: 1, perPage: $perPage) {
      _id
      title
      categories {
        _id
        title
        parentCategoryId
      }
    }
  }
`;
