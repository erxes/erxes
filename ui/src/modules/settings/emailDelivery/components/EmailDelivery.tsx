import DataWithLoader from 'modules/common/components/DataWithLoader';
import { FormControl } from 'modules/common/components/form';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { colors } from 'modules/common/styles';
import { Title } from 'modules/common/styles/main';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import * as React from 'react';
import Select from 'react-select-plus';
import { EMAIL_TYPES } from '../containers/EmailDelivery';
import Row from './Row';

type Props = {
  list: any;
  history: any;
  searchValue?: string;
  loading: boolean;
  count: number;
  emailType: string;
  handleSelectEmailType: (type: string) => void;
  handleSelectStatus: (status: string) => void;
  status: string;
};

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Email deliveries') }
];

const emailTypeOptions = [
  { value: 'transaction', label: __('Transaction') },
  { value: 'engage', label: __('SES Engage') }
];

const tableHeaders = {
  transaction: ['Subject', 'To', 'Cc', 'Bcc', 'From', 'Status', 'Created at'],
  engage: ['Customer', 'Title', 'Status', 'Created at']
};

export const STATUS_OPTIONS = [
  { value: 'send', label: 'Sent', color: colors.colorPrimary },
  { value: 'delivery', label: 'Delivered', color: colors.colorCoreBlue },
  { value: 'open', label: 'Opened', color: colors.colorCoreGreen },
  { value: 'click', label: 'Clicked', color: colors.colorCoreTeal },
  { value: 'complaint', label: 'Complained/Spammed', color: colors.colorCoreOrange },
  { value: 'bounce', label: 'Bounced', color: colors.colorCoreGray },
  { value: 'renderingfailure', label: 'Rendering failure', color: colors.colorCoreBlack },
  { value: 'reject', label: 'Rejected', color: colors.colorCoreRed },
];

function EmailDelivery({
  emailType,
  loading,
  count,
  list = [],
  handleSelectEmailType,
  searchValue,
  history,
  handleSelectStatus,
  status
}: Props) {
  const [search, setSearch] = React.useState(searchValue);

  const handleSearch = e => {
    const value = e.target.value;

    setSearch(value);

    router.removeParams(history, 'page');
    router.setParams(history, { searchValue: value });
  };

  const handleEmailtype = ({ value }: { value: string }) => {
    setSearch('');
    return handleSelectEmailType(value);
  };

  const handleStatusChange = ({ value }: { value: string }) => {
    return handleSelectStatus(value);
  };

  function renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            {(tableHeaders[emailType] || []).map((item, idx) => (
              <th key={idx}>{__(item)}</th>
            ))}
          </tr>
        </thead>
        <tbody>{list.map(item => <Row key={item._id} item={item} emailType={emailType} />)}</tbody>
      </Table>
    );
  }

  function renderActionBar() {
    const isTransaction = emailType === EMAIL_TYPES.TRANSACTION;

    const content = (
      <BarItems>
        {isTransaction ? (
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={handleSearch}
            value={search}
          />
        ) : null}

        <React.Fragment>
          <Select
            placeholder={__('Choose Email type')}
            value={emailType}
            options={emailTypeOptions}
            onChange={handleEmailtype}
            clearable={false}
          />
          {isTransaction ? null : (
            <Select
              placeholder={__('Choose status')}
              value={status}
              options={STATUS_OPTIONS}
              onChange={handleStatusChange}
              resetValue={[]}
            />
          )}
        </React.Fragment>
      </BarItems>
    );

    return (
      <Wrapper.ActionBar
        left={<Title>{__('Email Deliveries')}</Title>}
        right={content}
      />
    );
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Email Deliveries')}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={count} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={count}
          emptyText={__('There are no logs')}
          emptyImage="/images/actions/21.svg"
        />
      }
    />
  );
}

export default EmailDelivery;
