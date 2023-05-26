import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert, withProps, confirm } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  AddDashboardMutationResponse,
  DashboardsMainQueryResponse,
  DashboardsTotalCountQueryResponse,
  IDashboardDoc,
  ListQueryVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams?: any;
};

type FinalProps = {
  dashboardsMainQuery: DashboardsMainQueryResponse;
  dashboardsTotalCountQuery: DashboardsTotalCountQueryResponse;
} & Props &
  AddDashboardMutationResponse &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class ListContainer extends React.Component<FinalProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  refetchWithDelay = () => {
    this.timer = setTimeout(() => {
      this.props.dashboardsMainQuery.refetch();
    }, 5500);
  };

  render() {
    const {
      dashboardsMainQuery,
      dashboardsTotalCountQuery,
      dashboardsRemove,
      addDashboardMutation,
      history
    } = this.props;

    const counts = dashboardsTotalCountQuery
      ? dashboardsTotalCountQuery.dashboardsTotalCount
      : null;

    const removeDashboards = ({ dashboardIds }, emptyBulk) => {
      confirm().then(() => {
        dashboardsRemove({
          variables: { dashboardIds }
        })
          .then(() => {
            emptyBulk();
            Alert.success('You successfully deleted a dashboard.', 4500);

            this.refetchWithDelay();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const addDashboard = () => {
      addDashboardMutation({
        variables: {
          name: 'Your dashboard title',
          visibility: 'public',
          selectedMemberIds: []
        }
      })
        .then(data => {
          history.push({
            pathname: `/dashboard/details/${data.data.dashboardsAdd._id}`,
            search: '?isCreate=true'
          });
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      dashboardsMainQuery.dashboardsMain || {};

    const updatedProps = {
      ...this.props,
      counts,
      totalCount,
      searchValue,
      dashboards: list,
      loading: dashboardsMainQuery.loading || this.state.loading,
      refetch: this.refetchWithDelay,
      removeDashboards,
      addDashboard
    };

    const dashboardList = props => {
      return <List {...updatedProps} {...props} />;
    };

    return (
      <Bulk
        content={dashboardList}
        refetch={this.props.dashboardsMainQuery.refetch}
      />
    );
  }
}

const generateParams = ({ queryParams }) => {
  return {
    ...generatePaginationParams(queryParams),
    status: queryParams.status,
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    tag: queryParams.tag,
    departmentId: queryParams.departmentId,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  };
};

export const getRefetchQueries = (queryParams?: any) => {
  return [
    {
      query: gql(queries.dashboardsMain),
      variables: { ...generateParams({ queryParams }) }
    },
    'dashboardCountByTags'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, DashboardsMainQueryResponse, ListQueryVariables>(
      gql(queries.dashboardsMain),
      {
        name: 'dashboardsMainQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),

    graphql<{}, AddDashboardMutationResponse, IDashboardDoc>(
      gql(mutations.dashboardsAdd),
      {
        name: 'addDashboardMutation',
        options: () => ({
          refetchQueries: ['dashboardsMain']
        })
      }
    ),

    graphql<Props, DashboardsTotalCountQueryResponse>(gql(queries.totalCount), {
      name: 'dashboardsTotalCountQuery'
    }),

    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.dashboardsRemove),
      {
        name: 'dashboardsRemove',
        options: ({ queryParams }) => ({
          refetchQueries: getRefetchQueries(queryParams)
        })
      }
    )
  )(withRouter<IRouterProps>(ListContainer))
);
