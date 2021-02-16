import Spinner from 'erxes-ui/lib/components/Spinner';
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
} & IRouterProps;

function ListContainer({ configsQuery, totalCountQuery, ...props }: Props) {
  if (configsQuery.loading || totalCountQuery.loading) {
    return <Spinner />;
  }

  const configs = configsQuery.clientPortalGetConfigs || [];
  const totalCount = totalCountQuery.clientPortalConfigsTotalCount || 0;

  const updatedProps = {
    ...props,
    totalCount,
    configs
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
