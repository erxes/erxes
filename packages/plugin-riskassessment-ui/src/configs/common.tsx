import { router } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import { queries } from './graphql';

export const refetchQueries = queryParams => [
  {
    query: gql(queries.configs),
    variables: {
      ...generateParams({ queryParams })
    }
  },
  {
    query: gql(queries.totalCount),
    variables: {
      ...generateParams({ queryParams })
    }
  }
];

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {})
});
