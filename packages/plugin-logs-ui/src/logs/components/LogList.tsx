import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import _ from 'lodash';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { __, router } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import {
  FilterItem,
  FilterWrapper
} from '@erxes/ui-settings/src/permissions/styles';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
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
  // cards service items
  { value: 'cards:board', label: 'Boards' },
  { value: 'cards:dealBoards', label: 'Deal boards' },
  { value: 'cards:purchaseBoards', label: 'Purchase boards' },
  { value: 'cards:taskBoards', label: 'Task boards' },
  { value: 'cards:ticketBoards', label: 'Ticket boards' },
  { value: 'cards:growthHackBoards', label: 'Growth hack boards' },
  { value: 'cards:dealPipelines', label: 'Deal pipelines' },
  { value: 'cards:purchasePipelines', label: 'Purchase pipelines' },
  { value: 'cards:taskPipelines', label: 'Task pipelines' },
  { value: 'cards:ticketPipelines', label: 'Ticket pipelines' },
  { value: 'cards:growthHackPipelines', label: 'Growth hack pipelines' },
  { value: 'cards:checklist', label: 'Checklists' },
  { value: 'cards:checkListItem', label: 'Checklist items' },
  { value: 'cards:deal', label: 'Deals' },
  { value: 'cards:purchase', label: 'Purchases' },
  { value: 'cards:task', label: 'Tasks' },
  { value: 'cards:ticket', label: 'Tickets' },
  { value: 'cards:pipelineLabel', label: 'Pipeline labels' },
  { value: 'cards:pipelineTemplate', label: 'Pipeline templates' },
  { value: 'cards:growthHack', label: 'Growth hacks' },
  { value: 'cards:dealStages', label: 'Deal stages' },
  { value: 'cards:purchaseStages', label: 'Purchase stages' },
  { value: 'cards:taskStages', label: 'Task stages' },
  { value: 'cards:ticketStages', label: 'Ticket stages' },
  { value: 'cards:growthHackStages', label: 'Growth hack stages' },
  // core-api service items
  { value: 'core:brand', label: 'Brands' },
  { value: 'core:permission', label: 'Permissions' },
  { value: 'core:user', label: 'Users' },
  { value: 'core:userGroup', label: 'User groups' },
  { value: 'core:config', label: 'Config' },
  // inbox service items
  { value: 'inbox:integration', label: 'Integrations' },
  { value: 'inbox:channel', label: 'Channels' },
  // contacts service items
  { value: 'contacts:company', label: 'Companies' },
  { value: 'contacts:customer', label: 'Customers' },
  // products service items
  { value: 'products:product', label: 'Products' },
  { value: 'products:product-category', label: 'Product categories' },
  // knowledgebase service items
  { value: 'knowledgebase:knowledgeBaseTopic', label: 'Knowledgebase topics' },
  {
    value: 'knowledgebase:knowledgeBaseCategory',
    label: 'Knowledgebase categories'
  },
  {
    value: 'knowledgebase:knowledgeBaseArticle',
    label: 'Knowledgebase articles'
  },
  // others
  { value: 'engages:engage', label: 'Campaigns' },
  { value: 'internalnotes:internalNote', label: 'Internal notes' },
  { value: 'tags:tag', label: 'Tags' },
  { value: 'segments:segment', label: 'Segments' },
  { value: 'responseTemplate', label: 'Response templates' },
  { value: 'emailTemplate', label: 'Email templates' },
  { value: 'importHistory', label: 'Import histories' },
  { value: 'script', label: 'Scripts' }
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
    selectedItem: string | { value: string; label?: string }
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

  renderFilter() {
    const { action, userId, type } = this.state;

    const onUserChange = user => {
      this.setFilter('userId', user);
    };

    return (
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
          onClick={this.onClick}
          size="small"
        >
          {__('Filter')}
        </Button>
      </FilterWrapper>
    );
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
        footer={<Pagination count={count} />}
        content={
          <>
            {this.renderFilter()}
            <DataWithLoader
              data={this.renderContent()}
              loading={isLoading}
              count={count}
              emptyText={__('There are no logs recorded')}
              emptyImage="/images/actions/21.svg"
            />
          </>
        }
        hasBorder
      />
    );
  }
}

export default LogList;
