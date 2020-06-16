import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import Alert from 'modules/common/utils/Alert';
import React from 'react';
import { graphql } from 'react-apollo';
import Dashboard from '../components/Dashboard';
import { mutations, queries } from '../graphql';
import {
  DashboardItemsQueryResponse,
  EditDashboardItemMutationResponse,
  EditDashboardItemMutationVariables,
  RemoveDashboardItemMutationResponse,
  RemoveDashboardItemMutationVariables
} from '../types';

type Props = {
  id: string;
  history: any;
};

type FinalProps = {
  dashboardItemsQuery: DashboardItemsQueryResponse;
} & Props &
  EditDashboardItemMutationResponse &
  RemoveDashboardItemMutationResponse;

class DashboardContainer extends React.Component<FinalProps, {}> {
  render() {
    const {
      dashboardItemsQuery,
      editDashboardItemMutation,
      id,
      removeDashboardItemMutation
    } = this.props;

    if (dashboardItemsQuery.loading) {
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

    return (
      <Dashboard
        editDashboardItem={editDashboardItem}
        removeDashboardItem={removeDashboardItem}
        dashboardItems={dashboardItemsQuery.dashboardItems || []}
        dashboardId={id}
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
  graphql<
    Props,
    RemoveDashboardItemMutationResponse,
    RemoveDashboardItemMutationVariables
  >(gql(mutations.dashboardItemRemove), {
    name: 'removeDashboardItemMutation',
    options: () => ({
      refetchQueries: ['dashboardItemsQuery']
    })
  }),
  graphql<
    Props,
    EditDashboardItemMutationResponse,
    EditDashboardItemMutationVariables
  >(gql(mutations.dashboardItemEdit), {
    name: 'editDashboardItemMutation',
    options: {
      refetchQueries: ['dashboardItemsQuery']
    }
  })
)(DashboardContainer);
