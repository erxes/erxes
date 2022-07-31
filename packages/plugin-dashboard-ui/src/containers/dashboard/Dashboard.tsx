import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../../graphql';
import {
  DashboardDetailsQueryResponse,
  DashboardItemsQueryResponse,
  EditDashboardItemMutationResponse,
  EditDashboardItemMutationVariables,
  RemoveDashboardItemMutationResponse,
  RemoveDashboardItemMutationVariables
} from '../../types';

import Dashboard from '../../components/dashboard/Dashboard';
import Spinner from '@erxes/ui/src/components/Spinner';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  id: string;
  history: any;
  queryParams: any;
};

type FinalProps = {
  dashboardItemsQuery: DashboardItemsQueryResponse;
  dashboardDetailsQuery: DashboardDetailsQueryResponse;
} & Props &
  EditDashboardItemMutationResponse &
  RemoveDashboardItemMutationResponse &
  DashboardDetailsQueryResponse;

class DashboardContainer extends React.Component<FinalProps, {}> {
  render() {
    const {
      dashboardItemsQuery,
      editDashboardItemMutation,
      id,
      removeDashboardItemMutation,
      queryParams,
      dashboardDetailsQuery,
      history
    } = this.props;

    if (dashboardItemsQuery.loading || dashboardDetailsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const editDashboardItem = params => {
      editDashboardItemMutation({
        variables: {
          _id: params._id,
          layout: params.layout
        }
      }).catch(() => {
        return;
      });
    };

    const removeDashboardItem = itemId => {
      removeDashboardItemMutation({
        variables: {
          _id: itemId
        }
      })
        .then(() => {
          dashboardItemsQuery.refetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const dashboard = dashboardDetailsQuery.dashboardDetails || {};

    return (
      <Dashboard
        editDashboardItem={editDashboardItem}
        queryParams={queryParams}
        dashboard={dashboard}
        removeDashboardItem={removeDashboardItem}
        dashboardItems={dashboardItemsQuery.dashboardItems || []}
        dashboardId={id}
        history={history}
      />
    );
  }
}

export default compose(
  graphql<Props, DashboardItemsQueryResponse, { dashboardId: string }>(
    gql(queries.dashboardItems),
    {
      name: 'dashboardItemsQuery',
      options: ({ id }: { id: string }) => ({
        variables: {
          dashboardId: id
        }
      })
    }
  ),
  graphql<Props, DashboardDetailsQueryResponse, { _id: string }>(
    gql(queries.dashboardDetails),
    {
      name: 'dashboardDetailsQuery',
      options: ({ id }: { id: string }) => ({
        variables: {
          _id: id
        }
      })
    }
  ),
  graphql<
    Props,
    RemoveDashboardItemMutationResponse,
    RemoveDashboardItemMutationVariables
  >(gql(mutations.dashboardItemsRemove), {
    name: 'removeDashboardItemMutation',
    options: () => ({
      refetchQueries: ['dashboardItemsQuery']
    })
  }),

  graphql<
    Props,
    EditDashboardItemMutationResponse,
    EditDashboardItemMutationVariables
  >(gql(mutations.dashboardItemsEdit), {
    name: 'editDashboardItemMutation',
    options: {
      refetchQueries: ['dashboardItemsQuery']
    }
  })
)(DashboardContainer);
