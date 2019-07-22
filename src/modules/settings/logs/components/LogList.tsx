import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyState from 'modules/common/components/EmptyState';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import * as React from 'react';
import Select from 'react-select-plus';
import { FilterItem, FilterWrapper } from '../styles';
import { ILog } from '../types';
import LogRow from './LogRow';

type Props = {
  history: any;
  queryParams: any;
  isLoading: boolean;
  errorMessage?: string;
} & commonProps;

type State = {
  start?: string;
  end?: string;
  action?: string;
  page?: string;
  perPage?: string;
  userId?: string;
};

type commonProps = {
  users: IUser[];
  logs: ILog[];
  count: number;
  refetchQueries: any;
};

class LogList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const qp = props.queryParams || {
      start: '',
      end: '',
      action: '',
      userId: ''
    };

    this.onClick = this.onClick.bind(this);

    this.state = {
      start: qp.start,
      end: qp.end,
      action: qp.action,
      userId: qp.userId
    };
  }

  setFilter(name: string, item: { value: string; label?: string }) {
    this.setState({
      [name]: item ? item.value : '',
      page: '',
      perPage: ''
    });
  }

  onDateChange(type: string, date) {
    const filter = { ...this.state };

    if (date) {
      filter[type] = dayjs(date).format('YYYY-MM-DD HH:mm');
    } else {
      filter.start = '';
      filter.end = '';
    }

    this.setState(filter);
  }

  onClick() {
    const { history } = this.props;
    const { start, end, action, userId } = this.state;

    router.setParams(history, {
      start,
      end,
      action,
      userId
    });
  }

  renderObjects() {
    const { logs } = this.props;
    const rows: JSX.Element[] = [];

    if (!logs) {
      return rows;
    }

    for (const log of logs) {
      rows.push(<LogRow log={log} key={log._id} />);
    }

    return rows;
  }

  renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            <th>{__('Date')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Module')}</th>
            <th>{__('Action')}</th>
            <th>{__('Description')}</th>
            <th>{__('Changes')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  renderActionBar() {
    const { users } = this.props;
    const { start, end, action, userId } = this.state;
    const actionOptions = [
      { value: 'create', label: __('Create') },
      { value: 'update', label: __('Update') },
      { value: 'delete', label: __('Delete') }
    ];
    const userOptions = users.map(user => ({
      value: user._id,
      label: user.email
    }));

    const actionBarLeft = (
      <FilterWrapper>
        <FilterItem>
          <Datetime
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            value={start}
            closeOnSelect={true}
            onChange={this.onDateChange.bind(this, 'start')}
            inputProps={{ placeholder: `${__('Choose start date')}` }}
          />
        </FilterItem>
        <FilterItem>
          <Datetime
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            value={end}
            closeOnSelect={true}
            onChange={this.onDateChange.bind(this, 'end')}
            inputProps={{ placeholder: `${__('Choose end date')}` }}
          />
        </FilterItem>
        <FilterItem>
          <Select
            placeholder={__('Choose action')}
            value={action}
            options={actionOptions}
            onChange={this.setFilter.bind(this, 'action')}
          />
        </FilterItem>
        <FilterItem>
          <Select
            placeholder={__('Choose user')}
            options={userOptions}
            onChange={this.setFilter.bind(this, 'userId')}
            value={userId}
          />
        </FilterItem>
        <Button
          btnStyle="success"
          icon="filter"
          onClick={this.onClick}
          size="small"
        >
          {__('Filter')}
        </Button>
      </FilterWrapper>
    );

    return <Wrapper.ActionBar left={actionBarLeft} />;
  }

  render() {
    const { isLoading, count, errorMessage } = this.props;
    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: __('Logs') }
    ];
    const emptyImage = '/images/actions/21.svg';
    let actionBar = this.renderActionBar();
    let footer = <Pagination count={count} />;
    let emptyMessage = __('There are no logs recorded');
    let data = this.renderContent();

    // show EmptyState when viewLogs permission is not granted
    if (errorMessage && errorMessage.indexOf('Permission required') !== -1) {
      actionBar = <div />;
      footer = <div />;
      emptyMessage = __('Permission denied');
      data = <EmptyState text={emptyMessage} image={emptyImage} />;
    }

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Logs')} breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        footer={footer}
        content={
          <DataWithLoader
            data={data}
            loading={isLoading}
            count={count}
            emptyText={emptyMessage}
            emptyImage={emptyImage}
          />
        }
      />
    );
  }
}

export default LogList;
