import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import debounce from 'lodash/debounce';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import DashboardList from '../components/DashboardList';
import { mutations, queries } from '../graphql';
import {
  DashboardsQueryResponse,
  RemoveDashboardMutationResponse
} from '../types';

type Props = {
  currentDashboard?: string;
} & IRouterProps;

type FinalProps = {
  dashboardsQuery: DashboardsQueryResponse;
} & Props &
  IRouterProps &
  RemoveDashboardMutationResponse;

class DashboardListContainer extends React.Component<FinalProps> {
  render() {
    const {
      dashboardsQuery,
      removeDashboardMutation,
      history,
      currentDashboard
    } = this.props;

    if (dashboardsQuery.loading) {
      return <Spinner />;
    }

    const dashboards = dashboardsQuery.dashboards || [];

    const remove = id => {
      confirm().then(() => {
        removeDashboardMutation({
          variables: { _id: id }
        })
          .then(() => {
            Alert.success('You successfully deleted a dashboard.');

            if (localStorage.getItem('erxes_recent_dashboard') === id) {
              localStorage.setItem('erxes_recent_dashboard', '');
            }

            if (currentDashboard === id) {
              debounce(() => history.push('/dashboard'), 300)();
            }
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    return (
      <DashboardList
        {...this.props}
        dashboards={dashboards}
        loading={dashboardsQuery.loading}
        removeDashboard={remove}
      />
    );
  }
}

export default withRouter(
  withProps<Props>(
    compose(
      graphql<Props, DashboardsQueryResponse>(gql(queries.dashboards), {
        name: 'dashboardsQuery'
      }),
      graphql<Props, RemoveDashboardMutationResponse>(
        gql(mutations.dashboardRemove),
        {
          name: 'removeDashboardMutation',
          options: () => ({
            refetchQueries: ['dashboards']
          })
        }
      )
    )(DashboardListContainer)
  )
);
