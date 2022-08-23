import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import { __, router } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import { IDashboard, DashboardsCount } from '../types';
import { EmptyContent } from '../styles';
import Row from './Row';

interface IProps extends IRouterProps {
  dashboards: IDashboard[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IDashboard[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  addDashboard: () => void;
  removeDashboards: (
    doc: { dashboardIds: string[] },
    emptyBulk: () => void
  ) => void;
  queryParams: any;
  exportDashboards: (bulk: string[]) => void;
  duplicate: (_id: string) => void;
  refetch?: () => void;
  renderExpandButton?: any;
  isExpand?: boolean;
  counts: DashboardsCount;
}

type State = {
  searchValue?: string;
};

class DashboardsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, dashboards } = this.props;

    toggleAll(dashboards, 'dashboards');
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  removeDashboards = dashboards => {
    const dashboardIds: string[] = [];

    dashboards.forEach(dashboard => {
      dashboardIds.push(dashboard._id);
    });

    this.props.removeDashboards({ dashboardIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  afterTag = () => {
    this.props.emptyBulk();

    if (this.props.refetch) {
      this.props.refetch();
    }
  };

  render() {
    const {
      history,
      loading,
      toggleBulk,
      duplicate,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      isExpand,
      counts,
      addDashboard
    } = this.props;

    const dashboards = this.props.dashboards || [];

    const mainContent = (
      <withTableWrapper.Wrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>{__('Name')}</th>
              <th>{__('Items')}</th>
              <th>{__('Last updated by')}</th>
              <th>{__('Created by')}</th>
              <th>{__('Updated Date')}</th>
              <th>{__('Created date')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody id="dashboards" className={isExpand ? 'expand' : ''}>
            {(dashboards || []).map(dashboard => (
              <Row
                key={dashboard._id}
                dashboard={dashboard}
                isChecked={bulk.includes(dashboard)}
                history={history}
                removeDashboards={this.removeDashboards}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      actionBarLeft = (
        <BarItems>
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={() => this.removeDashboards(bulk)}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Search an dashboard')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />

        <Button
          btnStyle="success"
          size="small"
          icon="plus-circle"
          onClick={addDashboard}
        >
          {__('Create an dashboard')}
        </Button>
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Dashboards')}
            breadcrumb={[{ title: __('Dashboards') }]}
            queryParams={queryParams}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={(dashboards || []).length}
            emptyContent={
              <EmptyContent>
                <img src="/images/actions/31.svg" alt="empty-img" />

                <p>
                  <b>{__('You don’t have any dashboards yet')}.</b>.
                </p>
              </EmptyContent>
            }
          />
        }
      />
    );
  }
}

export default withTableWrapper(
  'Dashboard',
  withRouter<IRouterProps>(DashboardsList)
);
