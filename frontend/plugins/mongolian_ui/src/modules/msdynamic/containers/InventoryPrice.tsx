import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

import InventoryPrices from '../components/price/InventoryPrice';
import { mutations } from '../graphql';

type Props = {
  queryParams: any;
};

const InventoryPriceContainer = ({ queryParams }: Props) => {
  const [items, setItems] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const brandId = queryParams.brandId || 'noBrand';

  const [toSyncMsdPrices] = useMutation(gql(mutations.toSyncPrices));

  const setBrand = (brandId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('brandId', brandId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const setSyncStatus = (data: any, action: string) => {
    if (!data?.[action]?.items) return;

    data[action].items = data[action].items.map((d: any) => ({
      ...d,
      syncStatus: false,
    }));
  };

  const toSyncPrices = async () => {
    try {
      setLoading(true);

      const response = await toSyncMsdPrices({
        variables: { brandId },
      });

      const data = response.data.toSyncMsdPrices;

      setSyncStatus(data, 'create');
      setSyncStatus(data, 'update');
      setSyncStatus(data, 'match');
      setSyncStatus(data, 'delete');
      setSyncStatus(data, 'error');

      setItems(data);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InventoryPrices
      queryParams={queryParams}
      loading={loading}
      items={items}
      setBrand={setBrand}
      toSyncPrices={toSyncPrices}
    />
  );
};

export default InventoryPriceContainer;
