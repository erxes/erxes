import gql from 'graphql-tag';

export const GET_CYCLE_PROGRESS_BY_MEMBER = gql`
  query getCycleProgressByMember($_id: String!, $assigneeId: String) {
    getCycleProgressByMember(_id: $_id, assigneeId: $assigneeId)
  }
`;
