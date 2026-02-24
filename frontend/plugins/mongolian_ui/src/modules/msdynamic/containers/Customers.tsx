import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

import Customers from "../components/customers/Customers";
import { mutations } from "../graphql";

type Props = {
  queryParams: any;
};

const CustomersContainer = ({ queryParams }: Props) => {
  const [items, setItems] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const brandId = queryParams.brandId || "noBrand";

  const [toCheckMsdCustomers] = useMutation(
    gql(mutations.toCheckCustomers)
  );

  const [toSyncMsdCustomers] = useMutation(
    gql(mutations.toSyncCustomers)
  );

  const setBrand = (brandId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("brandId", brandId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const setSyncStatus = (data: any, action: string) => {
    data[action].items = data[action].items.map((d: any) => ({
      ...d,
      syncStatus: false,
    }));
  };

  const setSyncStatusTrue = (data: any, customers: any[], action: string) => {
    data[action].items = data[action].items.map((i: any) =>
      customers.find((c) => c.No === i.No)
        ? { ...i, syncStatus: true }
        : i
    );
  };

  const toCheckCustomers = async () => {
    try {
      setLoading(true);

      const response = await toCheckMsdCustomers({
        variables: { brandId },
      });

      const data = response.data.toCheckMsdCustomers;

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

  const toSyncCustomers = async (action: string, customers: any[]) => {
    try {
      setLoading(true);

      await toSyncMsdCustomers({
        variables: { brandId, action, customers },
      });

      const updated = { ...items };
      setSyncStatusTrue(updated, customers, action.toLowerCase());
      setItems(updated);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Customers
      queryParams={queryParams}
      loading={loading}
      items={items}
      setBrand={setBrand}
      toCheckCustomers={toCheckCustomers}
      toSyncCustomers={toSyncCustomers}
    />
  );
};

export default CustomersContainer;