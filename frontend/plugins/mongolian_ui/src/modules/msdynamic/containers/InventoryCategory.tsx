import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

import InventoryCategory from '../components/category/InventoryCategory';
import { mutations } from '../graphql';

type Props = {
  queryParams: any;
};

const InventoryCategoryContainer = ({ queryParams }: Props) => {
  const [items, setItems] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const brandId = queryParams.brandId || 'noBrand';
  const categoryId = queryParams.categoryId || 'noCategory';

  const [toCheckMsdProductCategories] = useMutation(
    gql(mutations.toCheckCategories),
  );

  const [toSyncMsdProductCategories] = useMutation(
    gql(mutations.toSyncCategories),
  );

  const setBrand = (brandId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('brandId', brandId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const setCategory = (categoryId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('categoryId', categoryId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const setSyncStatus = (data: any, action: string) => {
    data[action].items = data[action].items.map((d: any) => ({
      ...d,
      syncStatus: false,
    }));
  };

  const setSyncStatusTrue = (data: any, categories: any[], action: string) => {
    data[action].items = data[action].items.map((i: any) =>
      categories.find((c) => c.Code === i.Code)
        ? { ...i, syncStatus: true }
        : i,
    );
  };

  const toCheckCategory = async () => {
    try {
      setLoading(true);

      const response = await toCheckMsdProductCategories({
        variables: { brandId, categoryId },
      });

      const data = response.data.toCheckMsdProductCategories;

      setSyncStatus(data, 'create');
      setSyncStatus(data, 'update');
      setSyncStatus(data, 'delete');

      setItems(data);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toSyncCategory = async (action: string, categories: any[]) => {
    try {
      setLoading(true);

      await toSyncMsdProductCategories({
        variables: { brandId, categoryId, action, categories },
      });

      const updated = { ...items };
      setSyncStatusTrue(updated, categories, action.toLowerCase());
      setItems(updated);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InventoryCategory
      queryParams={queryParams}
      loading={loading}
      items={items}
      setBrand={setBrand}
      setCategory={setCategory}
      toCheckCategory={toCheckCategory}
      toSyncCategory={toSyncCategory}
    />
  );
};

export default InventoryCategoryContainer;
