import * as React from 'react';

import {
  FilterItem,
  FilterWrapper
} from '@erxes/ui-settings/src/permissions/styles';
import { __, router } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { ISmsDelivery } from '../types';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Row from './Row';
import Select from 'react-select-plus';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  history: any;
  queryParams: any;
  isLoading: boolean;
} & commonProps;

type State = {
  page?: string;
  perPage?: string;
  type: string;
};

type commonProps = {
  smsDeliveries: ISmsDelivery[];
  count?: number;
};

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('SMS deliveries') }
];

export const SOURCE_TYPES = {
  CAMPAIGN: 'campaign',
  INTEGRATION: 'integration',
  ALL: ['campaign', 'integration'],
  OPTIONS: [
    { value: 'campaign', label: 'Campaign' },
    { value: 'integration', label: 'Conversation' }
  ]
};

class SmsDeliveries extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const qp = props.queryParams || { type: '' };

    this.state = {
      type: qp.type || SOURCE_TYPES.CAMPAIGN
    };
  }

  onClick = () => {
    const { history } = this.props;
    const { type } = this.state;

    router.setParams(history, { type });
  };

  renderRows() {
    const { smsDeliveries } = this.props;
    const rows: JSX.Element[] = [];

    if (!smsDeliveries) {
      return rows;
    }

    for (const log of smsDeliveries) {
      rows.push(<Row key={log._id} log={log} type={this.state.type} />);
    }

    return rows;
  }

  renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            <th key="date">{__('Date')}</th>
            <th key="direction">{__('Direction')}</th>
            <th key="to">{__('To')}</th>
            <th key="status">{__('Status')}</th>
            <th key="campaign">{__('Campaign')}</th>
            <th key="from">{__('From')}</th>
            <th key="content">{__('Content')}</th>
            <th key="errors">{__('Error')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows()}</tbody>
      </Table>
    );
  }

  renderActionBar() {
    const { type } = this.state;

    const onTypeChange = option => {
      this.setState({
        type: option && option.value ? option.value : '',
        page: '',
        perPage: ''
      });
    };

    const actionBarLeft = (
      <FilterWrapper style={{ padding: '10px 0px' }}>
        <strong>{__('Filters')}:</strong>
        <FilterItem>
          <Select
            placeholder={__('Choose module')}
            value={SOURCE_TYPES.OPTIONS.find(item => item.value === type)}
            options={SOURCE_TYPES.OPTIONS}
            onChange={onTypeChange}
            clearable={false}
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

    return <Wrapper.ActionBar background="colorWhite" left={actionBarLeft} />;
  }

  render() {
    const { isLoading, count } = this.props;

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('SMS deliveries')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={this.renderActionBar()}
        footer={<Pagination count={count} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={isLoading}
            count={count}
            emptyText={__('There are no SMS deliveries recorded')}
            emptyImage="/images/actions/21.svg"
          />
        }
      />
    );
  }
}

export default SmsDeliveries;
