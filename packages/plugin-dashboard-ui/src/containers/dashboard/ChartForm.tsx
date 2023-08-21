import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import { DashboardGetTypesQueryResponse, IDashboardItem } from '../../types';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../../graphql';
import ChartForm from '../../components/explore/ChartForm';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  showDrawer: boolean;
  item?: IDashboardItem;
  cubejsApi?: any;
  dashboardId: string;
  toggleDrawer: () => void;
};

type FinalProps = {
  addDashboardItemMutation: (params) => Promise<void>;
  editDashboardItemMutation: (params) => Promise<void>;
  dashboardGetTypesQuery: DashboardGetTypesQueryResponse;
} & Props;

type State = {
  isLoading: boolean;
};

class ChartFormContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false };
  }

  render() {
    const {
      addDashboardItemMutation,
      editDashboardItemMutation,
      showDrawer,
      item,
      cubejsApi,
      dashboardId,
      toggleDrawer,
      dashboardGetTypesQuery
    } = this.props;

    if (dashboardGetTypesQuery && dashboardGetTypesQuery.loading) {
      return <Spinner />;
    }

    const schemaTypes = dashboardGetTypesQuery.dashboardGetTypes || [];

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
          toggleDrawer();
          Alert.success('Success');
        })

        .catch(error => {
          this.setState({ isLoading: false });
          return Alert.error(error.message);
        });
    };

    return (
      <ChartForm
        schemaTypes={schemaTypes}
        item={item}
        showDrawer={showDrawer}
        cubejsApi={cubejsApi}
        save={save}
        toggleDrawer={toggleDrawer}
      />
    );
  }
}

export default compose(
  graphql<Props, DashboardGetTypesQueryResponse, {}>(
    gql(queries.dashboardGetTypes),
    {
      name: 'dashboardGetTypesQuery'
    }
  ),
  graphql(gql(mutations.dashboardItemsAdd), {
    name: 'addDashboardItemMutation',
    options: () => ({
      refetchQueries: ['dashboardItemsQuery', 'dashboardItems']
    })
  }),
  graphql(gql(mutations.dashboardItemsEdit), {
    name: 'editDashboardItemMutation',
    options: () => ({
      refetchQueries: ['dashboardItemsQuery']
    })
  })
)(ChartFormContainer);
