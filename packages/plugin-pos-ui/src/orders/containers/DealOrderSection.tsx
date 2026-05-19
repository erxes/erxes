import Box from "@erxes/ui/src/components/Box";
import Spinner from "@erxes/ui/src/components/Spinner";
import { __ } from "@erxes/ui/src/utils/core";
import { gql, useQuery } from "@apollo/client";
import React from "react";
import queries from "../graphql/queries";

type Props = {
  mainType?: string;
  mainTypeId?: string;
};

type PaidAmount = {
  _id?: string;
  type: string;
  amount: number;
  title?: string;
};

type PosOrder = {
  _id: string;
  number?: string;
  paidDate?: string;
  totalAmount?: number;
  cashAmount?: number;
  mobileAmount?: number;
  paidAmounts?: PaidAmount[];
  posName?: string;
};

const formatAmount = (n: number = 0) =>
  new Intl.NumberFormat("en-US").format(n);

const DealOrderSection: React.FC<Props> = ({ mainType, mainTypeId }) => {
  if (mainType !== "deal" || !mainTypeId) {
    return null;
  }

  const { data, loading } = useQuery(gql(queries.posOrders), {
    variables: { dealId: mainTypeId },
    fetchPolicy: "network-only",
  });

  const orders: PosOrder[] = data?.posOrders || [];

  if (!loading && !orders.length) {
    return null;
  }

  const renderBody = () => {
    if (loading) {
      return <Spinner objective={true} />;
    }

    return (
      <ul
        style={{
          listStyle: "none",
          padding: 12,
          paddingLeft: 20,
          paddingRight: 20,
          margin: 0,
        }}
      >
        {orders.map((order) => {
          const entries: { label: string; amount: number }[] = [];
          if (order.cashAmount) {
            entries.push({ label: __("Cash"), amount: order.cashAmount });
          }
          if (order.mobileAmount) {
            entries.push({ label: __("Mobile"), amount: order.mobileAmount });
          }
          (order.paidAmounts || []).forEach((pa) =>
            entries.push({
              label: pa.title || pa.type,
              amount: Number(pa.amount) || 0,
            }),
          );

          return (
            <li
              key={order._id}
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                #{order.number || order._id}
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {order.posName}
                {order.paidDate
                  ? " · " + new Date(order.paidDate).toLocaleString()
                  : ""}
              </div>
              <div style={{ marginTop: 6 }}>
                {__("Total")}: <b>{formatAmount(order.totalAmount)}</b>
              </div>
              {entries.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "4px 0 0 0",
                  }}
                >
                  {entries.map((e, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{e.label}</span>
                      <span>{formatAmount(e.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Box title={__("POS Orders")} name="showPosOrders" isOpen={true}>
      {renderBody()}
    </Box>
  );
};

export default DealOrderSection;
