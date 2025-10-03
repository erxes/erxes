import gql from 'graphql-tag';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_ACTIVITIES = gql`
  query getOperationActivities($contentId: String!, ${GQL_CURSOR_PARAM_DEFS}) {
    getOperationActivities(contentId: $contentId, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        module
        action
        contentId
        metadata {
          newValue
          previousValue
        }
        createdBy
        createdAt
        updatedAt
      }
      ${GQL_PAGE_INFO}
      totalCount
    }
  }
`;
