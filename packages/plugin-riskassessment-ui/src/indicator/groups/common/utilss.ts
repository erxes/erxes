import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import { queries } from '../graphql';
export const refetchQueries = queryParams => [
  {
    query: gql(queries.list),
    variables: generateParams(queryParams || {})
  }
];
export const generateParams = queryParams => ({
  ...generatePaginationParams(queryParams || {}),
  searchValue: queryParams?.searchValue
});
