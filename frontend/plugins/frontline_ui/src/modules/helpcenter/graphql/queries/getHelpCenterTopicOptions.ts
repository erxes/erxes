import { gql } from '@apollo/client';

export const GET_HELP_CENTER_TOPIC_OPTIONS = gql`
  query frontlineHelpCenterTopicOptions($perPage: Int, $searchValue: String) {
    knowledgeBaseTopics(page: 1, perPage: $perPage, searchValue: $searchValue) {
      _id
      title
    }
  }
`;
