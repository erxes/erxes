import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import {
  ToCheckProductsMutationResponse,
  ToSyncProductsMutationResponse
} from '../types';
import { Bulk } from '@erxes/ui/src/components';
import Alert from '@erxes/ui/src/utils/Alert';
import { mutations } from '../graphql';
import React, { useState } from 'react';
import InventoryProducts from '../components/InventoryProducts';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {} & Props &
  ToCheckProductsMutationResponse &
  ToSyncProductsMutationResponse;

const InventoryProductsContainer = (props: FinalProps) => {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Spinner />;
  }

  const setSyncStatusTrue = (data: any, products: any, action: string) => {
    data[action].items = data[action].items.map(i => {
      if (products.find(c => c.code === i.code)) {
        const temp = i;
        temp.syncStatus = true;
        return temp;
      }
      return i;
    });
  };

  const setSyncStatus = (data: any, action: string) => {
    const createData = data[action].items.map(d => ({
      ...d,
      syncStatus: false
    }));
    data[action].items = createData;

    return data;
  };

  const toCheckProducts = () => {
    setLoading(true);
    props
      .toCheckProducts({
        variables: {}
      })
      .then(response => {
        const data = response.data.toCheckProducts;

        setSyncStatus(data, 'create');
        setSyncStatus(data, 'update');
        setSyncStatus(data, 'delete');

        setItems(response.data.toCheckProducts);
        setLoading(false);
      })
      .catch(e => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const toSyncProducts = (action: string, products: any[]) => {
    setLoading(true);
    props
      .toSyncProducts({
        variables: {
          action,
          products
        }
      })
      .then(() => {
        setLoading(false);
        Alert.success('Success. Please check again.');
      })
      .finally(() => {
        const data = items;

        setSyncStatusTrue(data, products, action.toLowerCase());
        setItems(data);
      })
      .catch(e => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const updatedProps = {
    ...props,
    loading,
    items,
    toCheckProducts,
    toSyncProducts
  };

  const content = () => <InventoryProducts {...updatedProps} />;

  return <Bulk content={content} />;
};

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
  )(InventoryProductsContainer)
);
