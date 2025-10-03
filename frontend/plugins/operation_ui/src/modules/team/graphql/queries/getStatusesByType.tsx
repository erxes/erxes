import gql from 'graphql-tag';

export const GET_STATUSES_BY_TYPE = gql`
  query getStatusesByType($teamId: String!, $type: Int!) {
    getStatusesByType(teamId: $teamId, type: $type) {
      _id
      name
      description
      color
      order
      type
    }
  }
`;
