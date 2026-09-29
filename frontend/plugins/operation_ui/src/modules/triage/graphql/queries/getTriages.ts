import { graphql } from '~/gql';

export const GET_TRIAGES = graphql(`
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
`);
