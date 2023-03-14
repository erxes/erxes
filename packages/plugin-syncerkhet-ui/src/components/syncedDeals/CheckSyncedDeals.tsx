import Button from '@erxes/ui/src/components/Button';
import CheckSyncedDealsSidebar from './CheckSyncedDealsSidebar';
import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import Row from './CheckSyncedDealsRow';
import { __, DataWithLoader, Pagination, Table } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import { Title } from '@erxes/ui/src/styles/main';
import { menuSyncerkhet } from '../../constants';

type Props = {
  totalCount: number;
  loading: boolean;
  deals: any[];
  history: any;
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

type State = {
  contentLoading: boolean;
};

class CheckSyncedDeals extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      contentLoading: this.props.loading
    };
  }

  renderRow = () => {
    const {
      deals,
      history,
      queryParams,
      toggleBulk,
      bulk,
      unSyncedDealIds,
      toSyncDeals,
      syncedDealInfos
    } = this.props;

    const toSync = dealIds => {
      toSyncDeals(dealIds, queryParams.configStageId, queryParams.dateType);
    };

    return deals.map(deal => (
      <Row
        history={history}
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

  onChange = () => {
    const { toggleAll, deals } = this.props;
    toggleAll(deals, 'deals');
  };

  checkSynced = async deals => {
    const dealIds: string[] = [];

    deals.forEach(deal => {
      dealIds.push(deal._id);
    });

    await this.props.checkSynced({ dealIds }, this.props.emptyBulk);
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
      'deal number',
      'Amount',
      'created At',
      'modified At',
      'stage Changed Date',
      'Un Synced',
      'Synced Date',
      'Synced bill Number',
      'Sync Actions'
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
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    const sidebar = (
      <CheckSyncedDealsSidebar
        queryParams={queryParams}
        history={this.props.history}
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
          toSyncDeals(
            unSyncedDealIds,
            queryParams.configStageId,
            queryParams.dateType
          );
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
            {`Sync all (${unSyncedDealIds.length})`}
          </Button>
        )}
      </BarItems>
    );

    const content = (
      <DataWithLoader
        data={Content}
        loading={loading || this.state.contentLoading}
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
            left={<Title>Deals</Title>}
            right={actionBarRight}
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
