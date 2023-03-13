import { router } from '@erxes/ui/src';
import gql from 'graphql-tag';
import { queries } from '../graphql';

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  sortFromDate: queryParams.from || undefined,
  sortToDate: queryParams.to || undefined,
  categoryId: queryParams.categoryId
});

export const refetchQueries = queryParams => [
  {
    query: gql(queries.list),
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
