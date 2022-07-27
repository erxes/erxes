import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert, withProps, confirm } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../components/List';
import { queries } from '../graphql';
import {
  DashboardsMainQueryResponse,
  DashboardsTotalCountQueryResponse,
  ListQueryVariables
} from '../types';

type Props = {
  queryParams?: any;
};

type FinalProps = {
  dashboardsMainQuery: DashboardsMainQueryResponse;
  dashboardsTotalCountQuery: DashboardsTotalCountQueryResponse;
} & Props &
  IRouterProps;

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
    const { dashboardsMainQuery, dashboardsTotalCountQuery } = this.props;

    const counts = dashboardsTotalCountQuery
      ? dashboardsTotalCountQuery.dashboardsTotalCount
      : null;

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      dashboardsMainQuery.dashboardsMain || {};

    const updatedProps = {
      ...this.props,
      counts,
      totalCount,
      searchValue,
      dashboard: list,
      loading: dashboardsMainQuery.loading || this.state.loading,
      refetch: this.refetchWithDelay
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
    }
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
    graphql<Props, DashboardsTotalCountQueryResponse>(gql(queries.totalCount), {
      name: 'dashboardsTotalCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          status: queryParams.status
        }
      })
    })
  )(withRouter<IRouterProps>(ListContainer))
);
