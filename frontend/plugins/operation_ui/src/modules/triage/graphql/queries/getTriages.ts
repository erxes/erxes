import gql from 'graphql-tag';

export const GET_TRIAGES = gql`
  query operationGetTriageList($filter: ITriageFilter) {
    operationGetTriageList(filter: $filter) {
      list {
        _id
        name
        description
        teamId
        createdBy
        number
        createdAt
        updatedAt
        priority
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
