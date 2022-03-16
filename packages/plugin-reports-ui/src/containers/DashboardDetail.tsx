import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import DashboardDetail from '../components/DashboardDetail';
import { queries } from '../graphql';
import { DashboardDetailsQueryResponse, IDashboard } from '../types';

type Props = {
  id: string;
  isExplore?: boolean;
  dashboard: IDashboard;
  dashboards: IDashboard[];
};

type FinalProps = {
  dashboardDetailQuery: DashboardDetailsQueryResponse;
} & Props &
  IRouterProps;

class DashboardDetailsContainer extends React.Component<FinalProps, {}> {
  render() {
    const { dashboardDetailQuery } = this.props;

    if (dashboardDetailQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      dashboard: dashboardDetailQuery.dashboardDetails || {} as IDashboard
    };

    return <DashboardDetail {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, DashboardDetailsQueryResponse, { _id: string }>(
      gql(queries.dashboardDetails),
      {
        name: 'dashboardDetailQuery',
        options: ({ id }: { id: string }) => ({
          variables: {
            _id: id
          }
        })
      }
    )
  )(DashboardDetailsContainer)
);
