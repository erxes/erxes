import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import { ToSyncPricesMutationResponse } from '../types';
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

type FinalProps = {} & Props & ToSyncPricesMutationResponse;

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

  const setSyncStatus = (data: any, action: string) => {
    const createData = data[action].items.map((d) => ({
      ...d,
      syncStatus: false,
    }));
    data[action].items = createData;

    return data;
  };

  const toSyncPrices = () => {
    setLoading(true);
    props
      .toSyncMsdPrices({
        variables: { brandId },
      })
      .then((response) => {
        const data = response.data.toSyncMsdPrices;

        setSyncStatus(data, 'create');
        setSyncStatus(data, 'update');
        setSyncStatus(data, 'match');
        setSyncStatus(data, 'delete');

        setItems(response.data.toSyncMsdPrices);
        setLoading(false);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const updatedProps = {
    ...props,
    loading,
    items,
    setBrand,
    toSyncPrices,
  };

  const content = () => <InventoryPrices {...updatedProps} />;

  return <Bulk content={content} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ToSyncPricesMutationResponse, {}>(
      gql(mutations.toSyncPrices),
      {
        name: 'toSyncMsdPrices',
      }
    )
  )(InventoryPriceContainer)
);
