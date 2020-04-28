import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';

import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Chart from '../components/Chart';
import { mutations, queries } from '../graphql';
import { DashboardItemDetailsQueryResponse } from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  dashBoardItemDetailsQuery: DashboardItemDetailsQueryResponse;
  addDashboardItemMutation: (params) => Promise<void>;
  editDashboardItemMutation: (params) => Promise<void>;
} & Props &
  IRouterProps;

type State = {
  isLoading: boolean;
};

class DashboardContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false };
  }

  render() {
    const {
      dashBoardItemDetailsQuery,
      addDashboardItemMutation,
      editDashboardItemMutation,
      history,
      queryParams
    } = this.props;

    if (dashBoardItemDetailsQuery && dashBoardItemDetailsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const dashboardId = queryParams.dashboardId;

    const save = params => {
      this.setState({ isLoading: true });

      params.dashboardId = dashboardId;
      params.vizState = JSON.stringify(params.vizState);

      const mutation = params._id
        ? editDashboardItemMutation
        : addDashboardItemMutation;

      return mutation({
        variables: { ...params }
      })
        .then(() => {
          Alert.success('Success');

          history.goBack();
        })

        .catch(error => {
          Alert.error(error.message);

          this.setState({ isLoading: false });
        });
    };

    return (
      <Chart
        dashboardId={dashboardId}
        save={save}
        isActionLoading={this.state.isLoading}
        dashboardItem={
          dashBoardItemDetailsQuery
            ? dashBoardItemDetailsQuery.dashboardItem
            : undefined
        }
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, DashboardItemDetailsQueryResponse>(
      gql(queries.dashboardItemDetail),
      {
        name: 'dashBoardItemDetailsQuery',
        skip: ({ queryParams }) => !queryParams.itemId,
        options: ({ queryParams }) => ({
          variables: {
            itemId: queryParams.itemId
          }
        })
      }
    ),
    graphql(gql(mutations.dashboardItemAdd), {
      name: 'addDashboardItemMutation',
      options: () => ({
        refetchQueries: ['dashboardItemsQuery']
      })
    }),
    graphql(gql(mutations.dashboardItemEdit), {
      name: 'editDashboardItemMutation',
      options: () => ({
        refetchQueries: ['dashboardItemsQuery']
      })
    })
  )(DashboardContainer)
);
