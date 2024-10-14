import { Alert, confirm } from "@erxes/ui/src/utils";
import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import { DataWithLoader, Pagination, Table, __ } from "@erxes/ui/src";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import CheckSyncedDealsSidebar from "./CheckSyncedDealsSidebar";
import FormControl from "@erxes/ui/src/components/form/Control";
import Row from "./CheckSyncedDealsRow";
import { Title } from "@erxes/ui/src/styles/main";
import { menuMultierkhet } from "../../constants";

type Props = {
  totalCount: number;
  loading: boolean;
  deals: any[];
  queryParams: any;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  checkSynced: (
    doc: { dealIds: string[] },
    emptyBulk: () => void
  ) => Promise<any>;
  toggleBulk: () => void;
  toggleAll: (targets: any[], containerId: string) => void;
  unSyncedDealIds: string[];
  syncedDealInfos: any;
  toSyncDeals: (
    dealIds: string[],
    configStageId: string,
    dateType: string
  ) => void;
  dateType: string;
};

const CheckSyncedDeals = (props: Props) => {
  const [contentLoading, setContentLoading] = useState(props.loading);
  const {
    deals,
    queryParams,
    toggleBulk,
    bulk,
    unSyncedDealIds,
    toSyncDeals,
    syncedDealInfos,
    toggleAll,
    emptyBulk,
    isAllSelected,
    loading,
    totalCount,
  } = props;

  const renderRow = () => {
    const toSync = (dealIds) => {
      toSyncDeals(dealIds, queryParams.configStageId, queryParams.dateType);
    };

    return deals.map((deal) => (
      <Row
        key={deal._id}
        deal={deal}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(deal)}
        isUnsynced={unSyncedDealIds.includes(deal._id)}
        toSync={toSync}
        syncedInfo={syncedDealInfos[deal._id] || {}}
      />
    ));
  };

  const onChange = () => {
    toggleAll(deals, "deals");
  };

  const checkSynced = async (deals) => {
    const dealIds: string[] = [];

    deals.forEach((deal) => {
      dealIds.push(deal._id);
    });

    await props.checkSynced({ dealIds }, emptyBulk);
  };

  const tablehead = [
    "deal name",
    "deal number",
    "Amount",
    "created At",
    "modified At",
    "stage Changed Date",
    "Un Synced",
    "",
    "Brand",
    "Synced Date",
    "Synced bill Number",
    "Synced Customer",
    "",
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
          {tablehead.map((p, i) => (
            <th key={i}>{p || ""}</th>
          ))}
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  const sidebar = <CheckSyncedDealsSidebar queryParams={queryParams} />;

  const onClickCheck = () => {
    confirm()
      .then(async () => {
        setContentLoading(true);
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
        toSyncDeals(
          unSyncedDealIds,
          queryParams.configStageId,
          queryParams.dateType
        );
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
      {unSyncedDealIds.length > 0 && (
        <Button
          btnStyle="warning"
          size="small"
          icon="sync"
          onClick={onClickSync}
        >
          {`Sync all (${unSyncedDealIds.length})`}
        </Button>
      )}
    </BarItems>
  );

  const content = (
    <DataWithLoader
      data={Content}
      loading={loading || contentLoading}
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
          left={<Title>Deals</Title>}
          right={actionBarRight}
          background="colorWhite"
        />
      }
      content={content}
      footer={<Pagination count={totalCount} />}
    />
  );
};

export default CheckSyncedDeals;
