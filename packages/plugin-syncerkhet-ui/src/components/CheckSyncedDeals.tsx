import Button from '@erxes/ui/src/components/Button';
import CheckSyncedDealsSidebar from './CheckSyncedDealsSidebar';
import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import Row from './CheckSyncedDealsRow';
import { __, DataWithLoader, Pagination, Table } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import { Title } from '@erxes/ui/src/styles/main';

type Props = {
  totalCount: number;
  loading: boolean;
  deals: any[];
  history: any;
  queryParams: any;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  checkSynced: (doc: { dealIds: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: any[], containerId: string) => void;
  unSyncedDealIds: string[];
  toSyncDeals: (dealIds: string[]) => void;
};

type State = {};

class CheckSyncedDeals extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  renderRow = () => {
    const {
      deals,
      history,
      toggleBulk,
      bulk,
      unSyncedDealIds,
      toSyncDeals
    } = this.props;

    return deals.map(deal => (
      <Row
        history={history}
        key={deal._id}
        deal={deal}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(deal)}
        isUnsynced={unSyncedDealIds.includes(deal._id)}
        toSync={toSyncDeals}
      />
    ));
  };

  onChange = () => {
    const { toggleAll, deals } = this.props;
    toggleAll(deals, 'deals');
  };

  checkSynced = deals => {
    const dealIds: string[] = [];

    deals.forEach(deal => {
      dealIds.push(deal._id);
    });

    this.props.checkSynced({ dealIds }, this.props.emptyBulk);
  };

  render() {
    const {
      totalCount,
      loading,
      queryParams,
      isAllSelected,
      bulk,
      unSyncedDealIds,
      toSyncDeals
    } = this.props;

    const tablehead = [
      'deal name',
      'Amount',
      'createdAt',
      'modifiedAt',
      'stageChangedDate'
    ];

    const Content = (
      <Table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={this.onChange}
              />
            </th>
            {tablehead.map(p => (
              <th key={p}>{p || ''}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    const header = <Wrapper.Header title={__('Check deals') + `(${1})`} />;

    const sidebar = (
      <CheckSyncedDealsSidebar
        queryParams={queryParams}
        history={this.props.history}
      />
    );

    const onClickCheck = () =>
      confirm()
        .then(() => {
          this.checkSynced(bulk);
        })
        .catch(error => {
          Alert.error(error.message);
        });

    const onClickSync = () =>
      confirm()
        .then(() => {
          toSyncDeals(unSyncedDealIds);
        })
        .catch(error => {
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
            Sync all
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
        header={header}
        leftSidebar={sidebar}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>Deals</Title>}
            right={actionBarRight}
            withMargin
            wide
            background="colorWhite"
          />
        }
        content={content}
        footer={<Pagination count={totalCount} />}
      />
    );
  }
}

export default CheckSyncedDeals;
