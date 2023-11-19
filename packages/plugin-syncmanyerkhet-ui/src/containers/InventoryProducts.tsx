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
import InventoryProducts from '../components/inventoryProducts/InventoryProducts';
import { mutations } from '../graphql';
import {
  ToCheckProductsMutationResponse,
  ToSyncProductsMutationResponse
} from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props &
  IRouterProps &
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

    const setSyncStatusTrue = (data: any, products: any, action: string) => {
      data[action].items = data[action].items.map(i => {
        if (products.find(c => c.code === i.code)) {
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

    const toSyncProducts = (action: string, products: any[]) => {
      this.setState({ loading: true });
      this.props
        .toSyncProducts({
          variables: {
            brandId: brandId,
            action: action,
            products: products
          }
        })
        .then(() => {
          this.setState({ loading: false });
          Alert.success('Success. Please check again.');
        })
        .finally(() => {
          let data = this.state.items;

          setSyncStatusTrue(data, products, action.toLowerCase());

          this.setState({ items: data });
        })
        .catch(e => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };
    const toCheckProducts = () => {
      this.setState({ loading: true });
      this.props
        .toCheckProducts({
          variables: { brandId }
        })
        .then(response => {
          let data = response.data.toCheckProducts;

          setSyncStatus(data, 'create');
          setSyncStatus(data, 'update');
          setSyncStatus(data, 'delete');

          this.setState({ items: response.data.toCheckProducts });
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
      toCheckProducts,
      setBrand,
      items,
      toSyncProducts
    };

    const content = props => <InventoryProducts {...props} {...updatedProps} />;

    return <Bulk content={content} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckProductsMutationResponse, {}>(
      gql(mutations.toCheckProducts),
      {
        name: 'toCheckProducts'
      }
    ),
    graphql<Props, ToSyncProductsMutationResponse, {}>(
      gql(mutations.toSyncProducts),
      {
        name: 'toSyncProducts'
      }
    )
  )(withRouter<IRouterProps>(InventoryProductsContainer))
);
