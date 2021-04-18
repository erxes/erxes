import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import _ from 'lodash';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyState from 'modules/common/components/EmptyState';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { FilterItem, FilterWrapper } from 'modules/settings/permissions/styles';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import * as React from 'react';
import Select from 'react-select-plus';
import { ILog } from '../types';
import LogRow from './LogRow';

type Props = {
  history: any;
  queryParams: any;
  isLoading: boolean;
  errorMessage: string;
} & commonProps;

type State = {
  start?: string;
  end?: string;
  action?: string;
  page?: string;
  perPage?: string;
  userId?: string;
  type?: string;
};

type commonProps = {
  logs: ILog[];
  count: number;
  refetchQueries: any;
};

const actionOptions = [
  { value: 'create', label: __('Create') },
  { value: 'update', label: __('Update') },
  { value: 'delete', label: __('Delete') }
];

// module names are saved exactly as these values in backend
// consider both ends when changing
const moduleOptions = [
  { value: 'board', label: 'Boards' },
  { value: 'dealBoards', label: 'Deal boards' },
  { value: 'taskBoards', label: 'Task boards' },
  { value: 'ticketBoards', label: 'Ticket boards' },
  { value: 'growthHackBoards', label: 'Growth hack boards' },
  { value: 'dealPipelines', label: 'Deal pipelines' },
  { value: 'taskPipelines', label: 'Task pipelines' },
  { value: 'ticketPipelines', label: 'Ticket pipelines' },
  { value: 'growthHackPipelines', label: 'Growth hack pipelines' },
  { value: 'checklist', label: 'Checklists' },
  { value: 'checkListItem', label: 'Checklist items' },
  { value: 'brand', label: 'Brands' },
  { value: 'channel', label: 'Channels' },
  { value: 'company', label: 'Companies' },
  { value: 'customer', label: 'Customers' },
  { value: 'deal', label: 'Deals' },
  { value: 'emailTemplate', label: 'Email templates' },
  { value: 'importHistory', label: 'Import histories' },
  { value: 'product', label: 'Products' },
  { value: 'product-category', label: 'Product categories' },
  { value: 'responseTemplate', label: 'Response templates' },
  { value: 'tag', label: 'Tags' },
  { value: 'task', label: 'Tasks' },
  { value: 'ticket', label: 'Tickets' },
  { value: 'permission', label: 'Permissions' },
  { value: 'user', label: 'Users' },
  { value: 'knowledgeBaseTopic', label: 'Knowledgebase topics' },
  { value: 'knowledgeBaseCategory', label: 'Knowledgebase categories' },
  { value: 'knowledgeBaseArticle', label: 'Knowledgebase articles' },
  { value: 'userGroup', label: 'User groups' },
  { value: 'internalNote', label: 'Internal notes' },
  { value: 'pipelineLabel', label: 'Pipeline labels' },
  { value: 'pipelineTemplate', label: 'Pipeline templates' },
  { value: 'growthHack', label: 'Growth hacks' },
  { value: 'integration', label: 'Integrations' },
  { value: 'segment', label: 'Segments' },
  { value: 'engage', label: 'Campaigns' },
  { value: 'script', label: 'Scripts' },
  { value: 'dealStages', label: 'Deal stages' },
  { value: 'taskStages', label: 'Task stages' },
  { value: 'ticketStages', label: 'Ticket stages' },
  { value: 'growthHackStages', label: 'Growth hack stages' }
];

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Logs') }
];

class LogList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const qp = props.queryParams || {
      start: '',
      end: '',
      action: '',
      userId: '',
      type: ''
    };

    this.state = {
      start: qp.start,
      end: qp.end,
      action: qp.action,
      userId: qp.userId,
      type: qp.type
    };
  }

  setFilter(
    name: string,
    selectedItem: string & { value: string; label?: string }
  ) {
    const value =
      typeof selectedItem === 'string'
        ? selectedItem
        : selectedItem
        ? selectedItem.value
        : '';

    this.setState({
      [name]: value,
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

  onClick = () => {
    const { history } = this.props;
    const { start, end, action, userId, type } = this.state;

    router.setParams(history, {
      start,
      end,
      action,
      userId,
      type
    });
  };

  renderObjects() {
    const { logs } = this.props;
    const rows: JSX.Element[] = [];

    if (!logs) {
      return rows;
    }

    for (const log of logs) {
      rows.push(<LogRow key={log._id} log={log} />);
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

  renderDateFilter = (name: string) => {
    const props = {
      value: this.state[name],
      onChange: this.onDateChange.bind(this, name),
      inputProps: {
        placeholder: `${__(`Choose ${name} date`)}`
      }
    };

    return (
      <FilterItem>
        <Datetime
          {...props}
          dateFormat="YYYY/MM/DD"
          timeFormat="HH:mm"
          closeOnSelect={true}
        />
      </FilterItem>
    );
  };

  renderActionBar() {
    const { action, userId, type } = this.state;

    const onUserChange = user => {
      this.setFilter('userId', user);
    };

    const actionBarLeft = (
      <FilterWrapper style={{ padding: '10px 0px' }}>
        <strong>{__('Filters')}:</strong>
        {this.renderDateFilter('start')}
        {this.renderDateFilter('end')}
        <FilterItem>
          <Select
            placeholder={__('Choose module')}
            value={type}
            options={_.sortBy(moduleOptions, ['label'])}
            onChange={this.setFilter.bind(this, 'type')}
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
          <SelectTeamMembers
            label="Choose users"
            name="userId"
            initialValue={userId || ''}
            onSelect={onUserChange}
            multi={false}
          />
        </FilterItem>
        <Button
          btnStyle="primary"
          icon="filter-1"
          uppercase={false}
          onClick={this.onClick}
          size="small"
        >
          {__('Filter')}
        </Button>
      </FilterWrapper>
    );

    return <Wrapper.ActionBar background="colorWhite" left={actionBarLeft} />;
  }

  render() {
    const { isLoading, count, errorMessage } = this.props;

    if (errorMessage.indexOf('Permission required') !== -1) {
      return (
        <EmptyState
          text={__('Permission denied')}
          image="/images/actions/21.svg"
        />
      );
    }

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
            emptyText={__('There are no logs recorded')}
            emptyImage="/images/actions/21.svg"
          />
        }
      />
    );
  }
}

export default LogList;
