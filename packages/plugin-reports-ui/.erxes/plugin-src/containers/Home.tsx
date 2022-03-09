import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Home from '../components/Home';
import { queries } from '../graphql';
import { DashboardsQueryResponse, IDashboard } from '../types';

type Props = {
  queryParams: any;
  dashboard: IDashboard;
  dashboards: IDashboard[];
} & IRouterProps;

type FinalProps = {
  dashboardsQuery: DashboardsQueryResponse;
} & Props;

class HomeContainer extends React.Component<FinalProps> {
  render() {
    const { dashboardsQuery } = this.props;

    if (dashboardsQuery.loading) {
      return <Spinner />;
    }

    const dashboards = dashboardsQuery.dashboards || [];

    return (
      <Home
        {...this.props}
        dashboards={dashboards}
        loading={dashboardsQuery.loading}
      />
    );
  }
}

export default withRouter(
  withProps<Props>(
    compose(
      graphql<Props, DashboardsQueryResponse>(gql(queries.dashboards), {
        name: 'dashboardsQuery'
      })
    )(HomeContainer)
  )
);
