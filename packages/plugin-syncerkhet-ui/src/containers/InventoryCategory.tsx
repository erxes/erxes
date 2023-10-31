import * as compose from 'lodash.flowright';
import Alert from '@erxes/ui/src/utils/Alert';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { IRouterProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils/core';
import { withRouter } from 'react-router-dom';
import InventoryCategory from '../components/inventoryCategory/InventoryCategory';
import {
  ToCheckCategoriesMutationResponse,
  ToSyncCategoriesMutationResponse
} from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props &
  IRouterProps &
  ToCheckCategoriesMutationResponse &
  ToSyncCategoriesMutationResponse;

type State = {
  items: any;
  loading: boolean;
};

class InventoryCategoryContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      items: {},
      loading: false
    };
  }

  render() {
    const { items, loading } = this.state;

    const setSyncStatus = (data: any, action: string) => {
      const createData = data[action].items.map(d => ({
        ...d,
        syncStatus: false
      }));
      data[action].items = createData;
      return data;
    };

    const setSyncStatusTrue = (data: any, categories: any, action: string) => {
      data[action].items = data[action].items.map(i => {
        if (categories.find(c => c.code === i.code)) {
          let temp = i;
          temp.syncStatus = true;
          return temp;
        }
        return i;
      });
    };

    const toSyncCategories = (action: string, categories: any[]) => {
      this.setState({ loading: true });
      this.props
        .toSyncCategories({
          variables: {
            action: action,
            categories: categories
          }
        })
        .then(() => {
          this.setState({ loading: false });
          Alert.success('Success. Please check again.');
        })
        .finally(() => {
          let data = this.state.items;

          setSyncStatusTrue(data, categories, action.toLowerCase());

          this.setState({ items: data });
        })
        .catch(e => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };

    const toCheckCategories = () => {
      this.setState({ loading: true });
      this.props
        .toCheckCategories({ variables: {} })
        .then(response => {
          let data = response.data.toCheckCategories;

          setSyncStatus(data, 'create');
          setSyncStatus(data, 'update');
          setSyncStatus(data, 'delete');

          this.setState({ items: response.data.toCheckCategories });
          this.setState({ loading: false });
        })
        .catch(e => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };

    if (loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      loading: loading,
      toCheckCategories,
      toSyncCategories,
      items
    };

    const content = props => <InventoryCategory {...props} {...updatedProps} />;

    return <Bulk content={content} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckCategoriesMutationResponse, {}>(
      gql(mutations.toCheckCategories),
      {
        name: 'toCheckCategories'
      }
    ),
    graphql<Props, ToSyncCategoriesMutationResponse, {}>(
      gql(mutations.toSyncCategories),
      {
        name: 'toSyncCategories'
      }
    )
  )(withRouter<IRouterProps>(InventoryCategoryContainer))
);
