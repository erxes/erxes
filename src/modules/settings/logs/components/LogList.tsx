import { IUser } from 'modules/auth/types';
import {
  Button,
  DataWithLoader,
  Pagination,
  Table
} from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import moment from 'moment';
import * as React from 'react';
import Datetime from 'react-datetime';
import Select from 'react-select-plus';
import { FilterItem, FilterWrapper } from '../styles';
import { ILog } from '../types';
import LogRow from './LogRow';

type Props = {
  history: any;
  queryParams: any;
  isLoading: boolean;
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
    const format = 'YYYY-MM-DD HH:mm';
    const filter = { ...this.state };

    // valid moment object
    if (date && date.format) {
      if (type === 'start') {
        filter.start = date.format(format);
      } else if (type === 'end') {
        filter.end = date.format(format);
      }
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
    const rows: any[] = [];

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
            value={moment(start)}
            closeOnSelect={true}
            onChange={this.onDateChange.bind(this, 'start')}
            inputProps={{ placeholder: `${__('Choose start date')}` }}
          />
        </FilterItem>
        <FilterItem>
          <Datetime
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            value={moment(end)}
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
    const { isLoading, count } = this.props;
    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: __('Logs') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Logs')} breadcrumb={breadcrumb} />}
        actionBar={this.renderActionBar()}
        footer={<Pagination count={count} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={isLoading}
            count={count}
            emptyText="There are no logs recorded"
            emptyImage="/images/actions/11.svg"
          />
        }
      />
    );
  }
}

export default LogList;
