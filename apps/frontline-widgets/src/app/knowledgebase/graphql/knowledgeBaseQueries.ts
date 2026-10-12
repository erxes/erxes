import { gql } from '@apollo/client';

export const WIDGETS_KNOWLEDGE_BASE_TOPIC = gql`
  query widgetsKnowledgeBaseTopic($_id: String!) {
    cpKnowledgeBaseTopicDetail(_id: $_id) {
      _id
      title
      description
      color
      categories {
        _id
        title
        description
        icon
        parentCategoryId
        articles(status: "publish") {
          _id
          title
          summary
          content
          modifiedDate
          publishedAt
        }
      }
    }
  }
`;
