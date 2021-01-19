import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import Alert from 'modules/common/utils/Alert';
import React from 'react';
import { graphql } from 'react-apollo';
import InitialData from '../components/initialData/InitialData';
import { mutations, queries } from '../graphql';
import { DashboardInitialDatasQueryResponse } from '../types';

type Props = {
  id: string;
  history: any;
  queryParams: any;
};

type FinalProps = {
  dashboardInitialDatasQuery: DashboardInitialDatasQueryResponse;
  addDashboardItemMutation: (params) => Promise<void>;
} & Props;

class DashboardContainer extends React.Component<FinalProps, {}> {
  render() {
    const { addDashboardItemMutation } = this.props;

    const save = params => {
      this.setState({ isLoading: true });

      params.dashboardId = dashboardId;
      const mutation = addDashboardItemMutation;

      return mutation({
        variables: { ...params }
      })
        .then(() => {
          Alert.success('Success');
        })

        .catch(error => {
          return Alert.error(error.message);
        });
    };

    const { dashboardInitialDatasQuery, queryParams } = this.props;
    const { dashboardId } = queryParams;

    if (dashboardInitialDatasQuery.loading) {
      return <Spinner objective={true} />;
    }

    const items = dashboardInitialDatasQuery.dashboardInitialDatas || [];

    return <InitialData items={items} dashboardId={dashboardId} save={save} />;
  }
}

export default compose(
  graphql<Props, DashboardInitialDatasQueryResponse, { type: string }>(
    gql(queries.dashboardInitialDatas),
    {
      name: 'dashboardInitialDatasQuery',
      options: ({ queryParams }) => ({
        variables: {
          type: queryParams.type
        }
      })
    }
  ),
  graphql(gql(mutations.dashboardItemAdd), {
    name: 'addDashboardItemMutation',
    options: () => ({
      refetchQueries: ['dashboardItemsQuery']
    })
  })
)(DashboardContainer);
