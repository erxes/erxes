import gql from 'graphql-tag';
import compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/List';
import queries from '../graphql/queries';
import {
  ClientPortalConfigsQueryResponse,
  ClientPortalTotalQueryResponse
} from '../types';

type Props = {
  configsQuery: ClientPortalConfigsQueryResponse;
  totalCountQuery: ClientPortalTotalQueryResponse;
  queryParams: any;
} & IRouterProps;

function ListContainer({ configsQuery, totalCountQuery, ...props }: Props) {
  const configs = configsQuery.clientPortalGetConfigs || [];
  const totalCount = totalCountQuery.clientPortalConfigsTotalCount || 0;

  const updatedProps = {
    ...props,
    totalCount,
    configs,
    loading: configsQuery.loading || false
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql(gql(queries.getConfigs), {
    name: 'configsQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage
      }
    })
  }),
  graphql(gql(queries.getTotalCount), {
    name: 'totalCountQuery'
  })
)(ListContainer);
