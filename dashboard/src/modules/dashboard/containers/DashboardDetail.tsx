import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import Dashboard from '../components/Dashboard';
import { mutations, queries } from '../graphql';
import {
  DashboardItemsQueryResponse,
  EditDashboardItemMutationResponse,
  EditDashboardItemMutationVariables
} from '../types';

type Props = {
  id: string;
  history: any;
};

type FinalProps = {
  dashboardItemsQuery: DashboardItemsQueryResponse;
} & Props &
  EditDashboardItemMutationResponse;

class DashboardContainer extends React.Component<FinalProps, {}> {
  render() {
    const { dashboardItemsQuery, editDashboardItemMutation, id } = this.props;

    if (dashboardItemsQuery.loading) {
      return  <div/>;
    }

    const editDashboardItem = params => {
      editDashboardItemMutation({
        variables: {
          _id: params._id,
          layout: params.layout
        }
      });
    };

    return (
      <Dashboard
        editDashboardItem={editDashboardItem}
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
    EditDashboardItemMutationResponse,
    EditDashboardItemMutationVariables
  >(gql(mutations.dashboardItemEdit), {
    name: 'editDashboardItemMutation',
    options: {
      refetchQueries: ['dashboardItemsQuery']
    }
  })
)(DashboardContainer);
