import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';

import Spinner from "modules/common/components/Spinner";
import { mutations, queries } from '../graphql/index';
import { queries as permissionQueries } from '../../permissions/graphql/index';
import AppList from '../components/AppList';
import { AppsQueryResponse, AppsTotalCountQueryResponse } from '../types';

type Props = {
  listQuery: AppsQueryResponse;
  totalCountQuery: AppsTotalCountQueryResponse;
  userGroupsQuery: any;
}

class AppListContainer extends React.Component<Props> {
  render() {
    const { listQuery, userGroupsQuery, totalCountQuery } = this.props;

    if (listQuery.loading || userGroupsQuery.loading || totalCountQuery.loading) {
      return <Spinner />;
    }

    return (
      <AppList
        apps={listQuery.apps}
        isLoading={listQuery.loading || userGroupsQuery.loading}
        count={totalCountQuery.appsTotalCount}
        errorMessage={listQuery.error || ''}
      />
    );
  }
}

export default compose(
  graphql(gql(queries.apps), {
    name: 'listQuery'
  }),
  graphql(gql(mutations.appsAdd), {
    name: 'addMutation',
  }),
  graphql(gql(permissionQueries.usersGroups), {
    name: 'userGroupsQuery'
  }),
  graphql(gql(queries.appsTotalCount), {
    name: 'totalCountQuery'
  })
)(AppListContainer);
