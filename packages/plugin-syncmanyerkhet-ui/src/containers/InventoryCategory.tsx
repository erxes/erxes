import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { router } from '@erxes/ui/src';
import { Bulk } from '@erxes/ui/src/components';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import Alert from '@erxes/ui/src/utils/Alert';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import { withRouter } from 'react-router-dom';
import InventoryCategory from '../components/inventoryCategory/InventoryCategory';
import { mutations } from '../graphql';
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
    const brandId = this.props.queryParams.brandId || 'noBrand';

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

    const setBrand = (brandId: string) => {
      router.setParams(this.props.history, { brandId: brandId });
      return router;
    };

    const toSyncCategories = (action: string, categories: any[]) => {
      this.setState({ loading: true });
      this.props
        .toSyncCategories({
          variables: {
            brandId,
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
        .toCheckCategories({ variables: { brandId } })
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
      setBrand,
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
