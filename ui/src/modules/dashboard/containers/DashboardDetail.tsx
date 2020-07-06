import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import DashboardDetail from '../components/DashboardDetail';
import { mutations, queries } from '../graphql';
import {
  DashboardDetailsQueryResponse,
  RemoveDashboardMutationResponse
} from '../types';

type Props = {
  id: string;
};

type FinalProps = {
  dashboardDetailQuery: DashboardDetailsQueryResponse;
} & Props &
  RemoveDashboardMutationResponse &
  IRouterProps;

class CustomerDetailsContainer extends React.Component<FinalProps, {}> {
  render() {
    const { dashboardDetailQuery, removeDashboardMutation } = this.props;

    if (dashboardDetailQuery.loading) {
      return <Spinner />;
    }

    const removeDashboard = () => {
      removeDashboardMutation()
        .then(() => {
          Alert.success('You successfully deleted a dashboard');
          window.location.href = '/dashboard';
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      dashboard: dashboardDetailQuery.dashboardDetails || {},
      removeDashboard
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
    ),
    graphql<Props, RemoveDashboardMutationResponse, { _id: string }>(
      gql(mutations.dashboardRemove),
      {
        name: 'removeDashboardMutation',
        options: props => ({
          refetchQueries: ['dashboards'],
          variables: {
            _id: props.id
          }
        })
      }
    )
  )(CustomerDetailsContainer)
);
