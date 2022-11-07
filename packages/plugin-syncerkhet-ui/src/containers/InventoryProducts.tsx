import * as compose from 'lodash.flowright';
import Alert from '@erxes/ui/src/utils/Alert';
import gql from 'graphql-tag';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from 'react-apollo';
import { IRouterProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils/core';
import { withRouter } from 'react-router-dom';
import InventoryProducts from '../components/inventoryProducts/InventoryProducts';
import {
  ToCheckProductsMutationResponse,
  ToSyncProductsMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
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
    const toSyncProducts = (action: string, products: any[]) => {
      this.setState({ loading: true });
      this.props
        .toSyncProducts({
          variables: {
            action: action,
            products: products
          }
        })
        .then(response => {
          this.setState({ loading: false });
          Alert.success('Success. Please check again.');
        })
        .finally(() => {
          this.setState({ items: [] });
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
          variables: {}
        })
        .then(response => {
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
