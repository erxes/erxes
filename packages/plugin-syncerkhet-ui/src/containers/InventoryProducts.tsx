import * as compose from 'lodash.flowright';

import {
  ToCheckProductsMutationResponse,
  ToSyncProductsMutationResponse,
} from '../types';

import Alert from '@erxes/ui/src/utils/Alert';
import { Bulk } from '@erxes/ui/src/components';
import InventoryProducts from '../components/inventoryProducts/InventoryProducts';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils/core';

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props &
  ToCheckProductsMutationResponse &
  ToSyncProductsMutationResponse;

type State = {
  items: any;
  loading: boolean;
};

class InventoryProductsContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      items: {},
      loading: false,
    };
  }

  render() {
    const { items, loading } = this.state;

    const setSyncStatus = (data: any, action: string) => {
      const createData = data[action].items.map((d) => ({
        ...d,
        syncStatus: false,
      }));
      data[action].items = createData;
      return data;
    };

    const setSyncStatusTrue = (data: any, products: any, action: string) => {
      data[action].items = data[action].items.map((i) => {
        if (products.find((c) => c.code === i.code)) {
          const temp = i;
          temp.syncStatus = true;
          return temp;
        }
        return i;
      });
    };

    const toSyncProducts = (action: string, products: any[]) => {
      this.setState({ loading: true });
      this.props
        .toSyncProducts({
          variables: {
            action,
            products,
          },
        })
        .then(() => {
          this.setState({ loading: false });
          Alert.success('Success. Please check again.');
        })
        .finally(() => {
          const data = this.state.items;

          setSyncStatusTrue(data, products, action.toLowerCase());

          this.setState({ items: data });
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };
    const toCheckProducts = () => {
      this.setState({ loading: true });
      this.props
        .toCheckProducts({
          variables: {},
        })
        .then((response) => {
          const data = response.data.toCheckProducts;

          setSyncStatus(data, 'create');
          setSyncStatus(data, 'update');
          setSyncStatus(data, 'delete');

          this.setState({ items: response.data.toCheckProducts });
          this.setState({ loading: false });
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };

    if (loading) {
      return <Spinner />;
    }
    const updatedProps = {
      ...this.props,
      loading,
      toCheckProducts,
      items,
      toSyncProducts,
    };

    const content = (props) => (
      <InventoryProducts {...props} {...updatedProps} />
    );

    return <Bulk content={content} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckProductsMutationResponse, {}>(
      gql(mutations.toCheckProducts),
      {
        name: 'toCheckProducts',
      },
    ),
    graphql<Props, ToSyncProductsMutationResponse, {}>(
      gql(mutations.toSyncProducts),
      {
        name: 'toSyncProducts',
      },
    ),
  )(InventoryProductsContainer),
);
