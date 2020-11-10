import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Home from '../components/Home';
import { queries } from '../graphql';
import { DashboardsQueryResponse } from '../types';

type Props = { queryParams: any } & IRouterProps;

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
