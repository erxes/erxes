import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../../graphql';
import {
  DashboardDetailsQueryResponse,
  DashboardItemsQueryResponse,
  EditDashboardItemMutationResponse,
  EditDashboardItemMutationVariables,
  EditDashboardMutationResponse,
  IDashboard,
  RemoveDashboardItemMutationResponse,
  RemoveDashboardItemMutationVariables
} from '../../types';
import { DepartmentsQueryResponse } from '@erxes/ui/src/team/types';
import { queries as teamQueries } from '@erxes/ui/src/team/graphql';

import Dashboard from '../../components/dashboard/Dashboard';
import Spinner from '@erxes/ui/src/components/Spinner';
import Alert from '@erxes/ui/src/utils/Alert';
import { confirm } from '@erxes/ui/src/utils';
import { getEnv } from '@erxes/ui/src/utils';
import { CubeProvider } from '@cubejs-client/react';
import cubejs from '@cubejs-client/core';

type Props = {
  id: string;
  history: any;
  queryParams: any;
};

type FinalProps = {
  dashboardItemsQuery: DashboardItemsQueryResponse;
  dashboardDetailsQuery: DashboardDetailsQueryResponse;
  departmentsQuery: DepartmentsQueryResponse;
} & Props &
  EditDashboardItemMutationResponse &
  RemoveDashboardItemMutationResponse &
  DashboardDetailsQueryResponse &
  EditDashboardMutationResponse;

const { REACT_APP_DASHBOARD_URL } = getEnv();

class DashboardContainer extends React.Component<
  FinalProps,
  { dashboardToken: any }
> {
  constructor(props) {
    super(props);

    this.state = {
      dashboardToken: null
    };
  }

  componentDidMount() {
    fetch(`${REACT_APP_DASHBOARD_URL}/get-token`)
      .then(response => response.json())
      .then(data => this.setState({ dashboardToken: data.dashboardToken }))
      .catch(error => console.log(error));
  }

  render() {
    const {
      dashboardItemsQuery,
      editDashboardItemMutation,
      id,
      removeDashboardItemMutation,
      queryParams,
      dashboardDetailsQuery,
      history,
      editDashboardMutation,
      departmentsQuery
    } = this.props;

    const { dashboardToken } = this.state;

    if (
      dashboardItemsQuery.loading ||
      dashboardDetailsQuery.loading ||
      departmentsQuery.loading ||
      !dashboardToken
    ) {
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
      confirm().then(() =>
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
          })
      );
    };

    const save = (doc: IDashboard) => {
      editDashboardMutation({
        variables: {
          ...doc
        }
      })
        .then(() => {
          Alert.success(
            `You successfully updated a ${doc.name || 'visibility'}`
          );
          dashboardDetailsQuery.refetch();
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const dashboard = dashboardDetailsQuery.dashboardDetails || {};
    const departments = departmentsQuery.departments || [];

    const cubejsApi = cubejs(dashboardToken, {
      apiUrl: `${REACT_APP_DASHBOARD_URL}/cubejs-api/v1`
    });

    return (
      <CubeProvider cubejsApi={cubejsApi}>
        <Dashboard
          editDashboardItem={editDashboardItem}
          queryParams={queryParams}
          dashboard={dashboard}
          removeDashboardItem={removeDashboardItem}
          dashboardItems={dashboardItemsQuery.dashboardItems || []}
          dashboardId={id}
          history={history}
          save={save}
          departments={departments}
        />
      </CubeProvider>
    );
  }
}

export default compose(
  graphql<Props, DashboardItemsQueryResponse, { dashboardId: string }>(
    gql(queries.dashboardItems),
    {
      name: 'dashboardItemsQuery',
      options: ({ id }: { id: string }) => ({
        fetchPolicy: 'network-only',
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
        fetchPolicy: 'network-only',
        variables: {
          _id: id
        }
      })
    }
  ),
  graphql<{}, DepartmentsQueryResponse>(gql(teamQueries.departments), {
    name: 'departmentsQuery'
  }),
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

  graphql<{}, EditDashboardMutationResponse, IDashboard>(
    gql(mutations.dashboardsEdit),
    {
      name: 'editDashboardMutation',
      options: () => ({
        refetchQueries: ['dashboardDetailsQuery']
      })
    }
  ),

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
