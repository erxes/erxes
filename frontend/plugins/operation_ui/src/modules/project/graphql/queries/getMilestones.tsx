import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';
import gql from 'graphql-tag';

export const GET_MILESTONES_INLINE = gql`
  query GetMilestones($projectId: String!, $searchValue: String, ${GQL_CURSOR_PARAM_DEFS}) {
    milestones(projectId: $projectId, searchValue: $searchValue, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        name
        targetDate
      } 
      ${GQL_PAGE_INFO}
    }
  }
`;
