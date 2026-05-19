import Box from "@erxes/ui/src/components/Box";
import Spinner from "@erxes/ui/src/components/Spinner";
import { __ } from "@erxes/ui/src/utils/core";
import { gql, useQuery } from "@apollo/client";
import React from "react";
import styled from "styled-components";
import queries from "../graphql/queries";

const OrderList = styled.ul`
  list-style: none;
  padding: 12px 20px;
  margin: 0;
`;

const OrderItem = styled.li`
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;

const OrderTitle = styled.div`
  font-weight: 600;
`;

const OrderMeta = styled.div`
  font-size: 12px;
  color: #888;
`;

const PaymentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 4px 0 0 0;
`;

const PaymentRow = styled.li`
  display: flex;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    font-weight: 600;
  }
`;

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

type PaymentTransaction = {
  _id: string;
  paymentKind?: string;
  amount?: number;
  status?: string;
};

type InvoiceWithTransactions = {
  _id: string;
  transactions?: PaymentTransaction[];
};

const formatAmount = (n: number = 0) =>
  new Intl.NumberFormat("en-US").format(n);

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const OrderRow: React.FC<{ order: PosOrder }> = ({ order }) => {
  const hasMobile = !!order.mobileAmount && order.mobileAmount > 0;

  const { data: invoiceData } = useQuery(gql(queries.invoiceDetailByContent), {
    variables: { contentType: "pos:orders", contentTypeId: order._id },
    skip: !hasMobile,
    fetchPolicy: "network-only",
  });

  const entries: { label: string; amount: number }[] = [];

  if (order.cashAmount) {
    entries.push({ label: __("Cash"), amount: order.cashAmount });
  }

  if (order?.paidAmounts?.length) {
    for (const paidAmount of order.paidAmounts) {
      entries.push({
        label: paidAmount.title || paidAmount.type,
        amount: Number(paidAmount.amount) || 0,
      });
    }
  }

  if (hasMobile) {
    const invoices: InvoiceWithTransactions[] = invoiceData?.invoiceDetailByContent || [];

    const byKind: Record<string, number> = {};

    for (const inv of invoices) {
      const transactions = inv.transactions || [];

      for (const t of transactions) {
        if (t.status !== "paid") continue;

        const kind = t.paymentKind || "mobile";
        byKind[kind] = (byKind[kind] || 0) + (Number(t.amount) || 0);
      }
    }

    for (const [kind, amount] of Object.entries(byKind)) {
      entries.push({
        label: capitalize(kind),
        amount,
      });
    }
  }

  return (
    <OrderItem>
      <OrderTitle>#{order.number || order._id}</OrderTitle>
      <OrderMeta>
        {order.posName}
        {order.paidDate
          ? " · " + new Date(order.paidDate).toLocaleString()
          : ""}
      </OrderMeta>
      {entries.length > 0 && (
        <PaymentList>
          {entries.map((e, i) => (
            <PaymentRow key={i}>
              <span>{e.label}</span>
              <span>{formatAmount(e.amount)}</span>
            </PaymentRow>
          ))}
        </PaymentList>
      )}
    </OrderItem>
  );
};

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
      <OrderList>
        {orders.map((order) => (
          <OrderRow key={order._id} order={order} />
        ))}
      </OrderList>
    );
  };

  return (
    <Box title={__("POS Orders")} name="showPosOrders" isOpen={true}>
      <div style={{ padding: "0 20px 20px" }}>
        {renderBody()}
      </div>
    </Box>
  );
};

export default DealOrderSection;
