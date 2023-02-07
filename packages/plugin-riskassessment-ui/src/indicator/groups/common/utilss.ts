import gql from 'graphql-tag';
import { queries } from '../graphql';
export const refetchQueries = () => [
  {
    query: gql(queries.list)
  }
];
