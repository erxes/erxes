import React from "react";
import { gql, useQuery } from "@apollo/client";

import Detail from "../components/syncedOrders/PosOrderDetail";
import { queries } from "../graphql";

type Props = {
  order: any;
};

const OrdersDetailContainer = ({ order }: Props) => {
  const { data, loading, error } = useQuery(
    gql(queries.posOrderDetail),
    {
      variables: { _id: order?._id },
      fetchPolicy: "network-only",
      skip: !order?._id,
    }
  );

  if (loading) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error) {
    console.error(error.message);
    return (
      <div className="py-6 text-center text-destructive">
        Failed to load order detail
      </div>
    );
  }

  const orderDetail = data?.posOrderDetail;

  return <Detail order={orderDetail} />;
};

export default OrdersDetailContainer;