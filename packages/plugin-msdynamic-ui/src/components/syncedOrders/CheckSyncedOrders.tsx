import { Title } from "@erxes/ui-settings/src/styles";
import {
  BarItems,
  DataWithLoader,
  Pagination,
  Table,
  Wrapper,
  __,
} from "@erxes/ui/src";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import { Alert, confirm } from "@erxes/ui/src/utils";
import React from "react";
import { menuDynamic } from "../../constants";
import Row from "./CheckSyncedOrdersRow";
import CheckSyncedOrdersSidebar from "./CheckSyncedOrdersSidebar";

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
  toSendMsdOrders: (orderIds: string[]) => void;
};

class CheckSyncedOrders extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  renderRow = () => {
    const {
      orders,
      toggleBulk,
      bulk,
      unSyncedOrderIds,
      toSendMsdOrders,
      syncedOrderInfos,
    } = this.props;

    return orders?.map((order) => (
      <Row
        key={order._id}
        order={order}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(order)}
        isUnsynced={unSyncedOrderIds.includes(order._id)}
        toSend={toSendMsdOrders}
        syncedInfo={syncedOrderInfos[order._id] || {}}
      />
    ));
  };

  onChange = () => {
    const { toggleAll, orders } = this.props;
    toggleAll(orders, "orders");
  };

  checkSynced = async (_orders: any) => {
    const orderIds: string[] = [];

    _orders.forEach((order) => {
      orderIds.push(order._id);
    });

    await this.props.checkSynced({ orderIds }, this.props.emptyBulk);
  };

  render() {
    const {
      totalCount,
      queryParams,
      isAllSelected,
      bulk,
      loading,
    } = this.props;
    const tablehead = [
      "Number",
      "Total Amount",
      "Created At",
      "Paid At",
      "Synced Date",
      "Synced bill Number",
      "Synced customer",
      "Sync Actions",
    ];
    const Content = (
      <Table $bordered={true}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={this.onChange}
              />
            </th>
            {tablehead?.map((p) => <th key={p}>{p || ""}</th>)}
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    const sidebar = <CheckSyncedOrdersSidebar queryParams={queryParams} />;

    const onClickCheck = () => {
      confirm()
        .then(async () => {
          this.setState({ contentLoading: true });
          await this.checkSynced(bulk);
          this.setState({ contentLoading: false });
        })
        .catch((error) => {
          Alert.error(error.message);
          this.setState({ contentLoading: false });
        });
    };

    const actionBarRight = (
      <BarItems>
        {bulk.length > 0 && (
          <Button btnStyle="success" icon="check-circle" onClick={onClickCheck}>
            Check
          </Button>
        )}
      </BarItems>
    );

    const content = (
      <DataWithLoader
        data={Content}
        loading={loading}
        count={totalCount}
        emptyText="Empty list"
        emptyImage="/images/actions/1.svg"
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Check msdynamic`)}
            queryParams={queryParams}
            submenu={menuDynamic}
          />
        }
        leftSidebar={sidebar}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`Orders (${totalCount})`)}</Title>}
            right={actionBarRight}
            background="colorWhite"
            wideSpacing={true}
          />
        }
        content={content}
        footer={<Pagination count={totalCount} />}
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default CheckSyncedOrders;
