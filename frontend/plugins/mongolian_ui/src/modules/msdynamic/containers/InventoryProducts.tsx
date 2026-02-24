import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

import InventoryProducts from '../components/products/InventoryProducts';
import { mutations } from "../graphql";

type Props = {
  queryParams: any;
};

const InventoryProductsContainer = ({ queryParams }: Props) => {
  const [items, setItems] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const brandId = queryParams.brandId || "noBrand";

  const [toCheckMsdProducts] = useMutation(
    gql(mutations.toCheckProducts)
  );

  const [toSyncMsdProducts] = useMutation(
    gql(mutations.toSyncProducts)
  );

  const setBrand = (brandId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("brandId", brandId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const setSyncStatus = (data: any, action: string) => {
    if (!data?.[action]?.items) return;

    data[action].items = data[action].items.map((d: any) => ({
      ...d,
      syncStatus: false,
    }));
  };

  const setSyncStatusTrue = (data: any, products: any[], action: string) => {
    if (!data?.[action]?.items) return;

    data[action].items = data[action].items.map((i: any) =>
      products.find((p) => p.Common_Item_No === i.Common_Item_No)
        ? { ...i, syncStatus: true }
        : i
    );
  };

  const toCheckProducts = async () => {
    try {
      setLoading(true);

      const response = await toCheckMsdProducts({
        variables: { brandId },
      });

      const data = response.data.toCheckMsdProducts;

      setSyncStatus(data, "create");
      setSyncStatus(data, "update");
      setSyncStatus(data, "delete");

      setItems(data);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toSyncProducts = async (action: string, products: any[]) => {
    try {
      setLoading(true);

      await toSyncMsdProducts({
        variables: { brandId, action, products },
      });

      const updated = { ...items };
      setSyncStatusTrue(updated, products, action.toLowerCase());
      setItems(updated);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InventoryProducts
      queryParams={queryParams}
      loading={loading}
      items={items}
      setBrand={setBrand}
      toCheckProducts={toCheckProducts}
      toSyncProducts={toSyncProducts}
    />
  );
};

export default InventoryProductsContainer;