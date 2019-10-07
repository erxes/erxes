import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { IEmail } from 'modules/inbox/types';
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

export const formatStr = (emailString: string) => {
  return emailString ? emailString.split(/[,]+/).join(',') : '';
};

export const formatObj = (emailArray: IEmail[]) => {
  return emailArray ? emailArray.map(s => s.email).join(',') : '';
};
