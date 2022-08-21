import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import {
  IDashboardItem,
  RemoveDashboardItemMutationResponse
} from '../../types';
import { graphql } from 'react-apollo';
import { mutations } from '../../graphql';
import ChartForm from '../../components/explore/ChartForm';

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
      toggleDrawer
    } = this.props;

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
          toggleDrawer();
        })

        .catch(error => {
          this.setState({ isLoading: false });
          return Alert.error(error.message);
        });
    };

    return (
      <ChartForm
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
