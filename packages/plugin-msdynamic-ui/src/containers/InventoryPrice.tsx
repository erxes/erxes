import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import {
  ToCheckPricesMutationResponse,
  ToSyncPricesMutationResponse
} from '../types';
import { router } from '@erxes/ui/src';
import { Bulk } from '@erxes/ui/src/components';
import Alert from '@erxes/ui/src/utils/Alert';
import { mutations } from '../graphql';
import React, { useState } from 'react';
import InventoryPrices from '../components/price/InventoryPrice';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {} & Props &
  ToCheckPricesMutationResponse &
  ToSyncPricesMutationResponse;

const InventoryPriceContainer = (props: FinalProps) => {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);
  const brandId = props.queryParams.brandId || 'noBrand';

  const setBrand = (brandId: string) => {
    router.setParams(props.history, { brandId: brandId });
    return router;
  };

  if (loading) {
    return <Spinner />;
  }

  const setSyncStatusTrue = (data: any, prices: any, action: string) => {
    data[action].items = data[action].items.map(i => {
      if (prices.find(c => c.code === i.code)) {
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

  const toCheckPrices = () => {
    setLoading(true);
    props
      .toCheckPrices({
        variables: { brandId }
      })
      .then(response => {
        const data = response.data.toCheckPrices;

        setSyncStatus(data, 'create');
        setSyncStatus(data, 'update');
        setSyncStatus(data, 'delete');

        setItems(response.data.toCheckPrices);
        setLoading(false);
      })
      .catch(e => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const toSyncPrices = (action: string, prices: any[]) => {
    setLoading(true);
    props
      .toSyncPrices({
        variables: {
          brandId,
          action,
          prices
        }
      })
      .then(() => {
        setLoading(false);
        Alert.success('Success. Please check again.');
      })
      .finally(() => {
        const data = items;

        setSyncStatusTrue(data, prices, action.toLowerCase());
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
    setBrand,
    toCheckPrices,
    toSyncPrices
  };

  const content = () => <InventoryPrices {...updatedProps} />;

  return <Bulk content={content} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckPricesMutationResponse, {}>(
      gql(mutations.toCheckPrices),
      {
        name: 'toCheckPrices'
      }
    ),
    graphql<Props, ToSyncPricesMutationResponse, {}>(
      gql(mutations.toSyncPrices),
      {
        name: 'toSyncPrices'
      }
    )
  )(InventoryPriceContainer)
);
