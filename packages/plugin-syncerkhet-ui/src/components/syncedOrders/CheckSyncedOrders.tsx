import Button from '@erxes/ui/src/components/Button';
import CheckSyncedOrdersSidebar from './CheckSyncedOrdersSidebar';
import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import Row from './CheckSyncedOrdersRow';
import {
  __,
  BarItems,
  Wrapper,
  DataWithLoader,
  Pagination,
  Table
} from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';

import { menuSyncerkhet } from '../../constants';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  totalCount: number;
  loading: boolean;
  orders: any[];
  history: any;
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

class CheckSyncedOrders extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  renderRow = () => {
    const {
      orders,
      history,
      toggleBulk,
      bulk,
      unSyncedOrderIds,
      toSyncOrders,
      syncedOrderInfos
    } = this.props;

    return orders?.map(order => (
      <Row
        history={history}
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

  onChange = () => {
    const { toggleAll, orders } = this.props;
    toggleAll(orders, 'orders');
  };

  checkSynced = async (_orders: any) => {
    const orderIds: string[] = [];

    _orders.forEach(order => {
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
      unSyncedOrderIds,
      toSyncOrders,
      posList,
      syncedOrderInfos
    } = this.props;
    const tablehead = [
      'Number',
      'Total Amount',
      'Created At',
      'Paid At',
      'Synced',
      'Synced Date',
      'Synced bill Number',
      'Synced customer',
      'Sync Actions'
    ];
    const Content = (
      <Table bordered={true}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={this.onChange}
              />
            </th>
            {tablehead?.map(p => (
              <th key={p}>{p || ''}</th>
            ))}
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    const sidebar = (
      <CheckSyncedOrdersSidebar
        queryParams={queryParams}
        history={this.props.history}
        posList={posList}
      />
    );

    const onClickCheck = () => {
      confirm()
        .then(async () => {
          this.setState({ contentLoading: true });
          await this.checkSynced(bulk);
          this.setState({ contentLoading: false });
        })
        .catch(error => {
          Alert.error(error.message);
          this.setState({ contentLoading: false });
        });
    };

    const onClickSync = () =>
      confirm()
        .then(() => {
          toSyncOrders(unSyncedOrderIds);
        })
        .catch(error => {
          Alert.error(error.message);
        });

    const actionBarRight = (
      <BarItems>
        {bulk.length > 0 && (
          <Button btnStyle="success" icon="check-circle" onClick={onClickCheck}>
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
            title={__(`Check erkhet`)}
            queryParams={queryParams}
            submenu={menuSyncerkhet}
          />
        }
        leftSidebar={sidebar}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`Orders (${totalCount})`)}</Title>}
            right={actionBarRight}
            // withMargin
            // wide
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
