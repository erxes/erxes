import Button from "@erxes/ui/src/components/Button";
import CheckSyncedOrdersSidebar from "./CheckSyncedOrdersSidebar";
import FormControl from "@erxes/ui/src/components/form/Control";
import React, { useState } from "react";
import Row from "./CheckSyncedOrdersRow";
import { __, DataWithLoader, Pagination, Table } from "@erxes/ui/src";
import { Alert, confirm } from "@erxes/ui/src/utils";
import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import { Title } from "@erxes/ui/src/styles/main";
import { menuMultierkhet } from "../../constants";

type Props = {
  totalCount: number;
  loading: boolean;
  orders: any[];
  queryParams: any;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  checkSynced: (
    doc: { orderIds: string[] },
    emptyBulk: () => void
  ) => Promise<any>;
  toggleBulk: () => void;
  toggleAll: (targets: any[], containerId: string) => void;
  unSyncedOrderIds: string[];
  syncedOrderInfos: any;
  toSyncOrders: (orderIds: string[]) => void;
  posList?: any[];
};

const CheckSyncedOrders = (props: Props) => {
  const [contentLoading, setContentLoading] = useState(props.loading);
  const {
    orders,
    toggleBulk,
    bulk,
    unSyncedOrderIds,
    toSyncOrders,
    syncedOrderInfos,
    totalCount,
    queryParams,
    isAllSelected,
    loading,
    posList,
    toggleAll,
    emptyBulk,
  } = props;

  const renderRow = () => {
    return orders?.map((order) => (
      <Row
        key={order._id}
        order={order}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(order)}
        isUnsynced={unSyncedOrderIds.includes(order._id)}
        toSync={toSyncOrders}
        syncedInfo={syncedOrderInfos[order._id] || {}}
      />
    ));
  };

  const onChange = () => {
    toggleAll(orders, "orders");
  };

  const checkSynced = async (_orders: any) => {
    const orderIds: string[] = [];

    _orders.forEach((order) => {
      orderIds.push(order._id);
    });

    await props.checkSynced({ orderIds }, emptyBulk);
  };

  const tablehead = [
    "Number",
    "Total Amount",
    "Created At",
    "Paid At",
    "Synced",
    "Brand",
    "Synced Date",
    "Synced bill Number",
    "Synced customer",
    "Sync Actions",
  ];
  const Content = (
    <Table>
      <thead>
        <tr>
          <th style={{ width: 60 }}>
            <FormControl
              checked={isAllSelected}
              componentclass="checkbox"
              onChange={onChange}
            />
          </th>
          {tablehead?.map((p) => <th key={p}>{p || ""}</th>)}
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  const sidebar = (
    <CheckSyncedOrdersSidebar queryParams={queryParams} posList={posList} />
  );

  const onClickCheck = () => {
    confirm()
      .then(async () => {
        setContentLoading(true);
        await checkSynced(bulk);
        setContentLoading(false);
      })
      .catch((error) => {
        Alert.error(error.message);
        setContentLoading(false);
      });
  };

  const onClickSync = () =>
    confirm()
      .then(() => {
        toSyncOrders(unSyncedOrderIds);
      })
      .catch((error) => {
        Alert.error(error.message);
      });

  const actionBarRight = (
    <BarItems>
      {bulk.length > 0 && (
        <Button
          btnStyle="success"
          size="small"
          icon="check-1"
          onClick={onClickCheck}
        >
          Check
        </Button>
      )}
      {unSyncedOrderIds.length > 0 && (
        <Button
          btnStyle="warning"
          size="small"
          icon="sync"
          onClick={onClickSync}
        >
          {`Sync all (${unSyncedOrderIds.length})`}
        </Button>
      )}
    </BarItems>
  );

  const content = (
    <DataWithLoader
      data={Content}
      loading={contentLoading && loading}
      count={totalCount}
      emptyText={__("Empty list")}
      emptyImage="/images/actions/1.svg"
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Check erkhet`)}
          queryParams={queryParams}
          submenu={menuMultierkhet}
        />
      }
      leftSidebar={sidebar}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>Orders</Title>}
          right={actionBarRight}
          // withMargin
          // wide
          background="colorWhite"
        />
      }
      content={content}
      footer={<Pagination count={totalCount} />}
    />
  );
};

export default CheckSyncedOrders;
