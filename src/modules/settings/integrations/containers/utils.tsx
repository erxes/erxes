import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { queries } from '../graphql';

export const integrationsListParams = queryParams => ({
  ...generatePaginationParams(queryParams),
  searchValue: queryParams.searchValue,
  kind: queryParams.kind
});

export const getRefetchQueries = (kind: string) => {
  return [
    {
      query: gql(queries.integrations),
      variables: {
        ...integrationsListParams({}),
        kind
      }
    },
    {
      query: gql(queries.integrationTotalCount),
      variables: {
        ...integrationsListParams({}),
        kind
      }
    }
  ];
};

export const formatStr = (str: string) => {
  return str ? str.split(/[,]+/).join(',') : '';
};
