import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import { queries } from '../graphql';
export const generateParams = queryParams => ({
  ...generatePaginationParams(queryParams || {}),
  searchValue: queryParams?.searchValue
});

export const refetchQueries = queryParams => [
  {
    query: gql(queries.operations),
    variables: generateParams(queryParams)
  },
  {
    query: gql(queries.operationsTotalCount),
    variables: generateParams(queryParams)
  }
];
