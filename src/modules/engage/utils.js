import gql from 'graphql-tag';
import { queries } from './graphql';

export const generateListQueryVariables = ({ queryParams }) => ({
  page: queryParams.page,
  perPage: queryParams.perPage || 20,
  kind: queryParams.kind,
  status: queryParams.status,
  tag: queryParams.tag,
  ids: queryParams.ids
});

export const crudMutationsOptions = queryParams => {
  return {
    refetchQueries: [
      {
        query: gql(queries.engageMessages),
        variables: generateListQueryVariables({ queryParams: {} })
      },
      {
        query: gql(queries.engageMessagesTotalCount)
      },
      {
        query: gql(queries.kindCounts)
      },
      {
        query: gql(queries.statusCounts),
        variables: { kind: '' }
      }
    ]
  };
};
