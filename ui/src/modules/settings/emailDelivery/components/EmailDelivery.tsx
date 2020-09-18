import dayjs from 'dayjs';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { FilterItem, FilterWrapper } from 'modules/settings/permissions/styles';
import * as React from 'react';
import Select from 'react-select-plus';
import { EMAIL_TYPES } from '../containers/EmailDelivery';

type Props = {
  list: any;
  loading: boolean;
  count: number;
  emailType: string;
  handleSelectEmailType: (type: string) => void;
};

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Email deliveries') }
];

const emailTypeOptions = [
  { value: 'transaction', label: __('SES Transaction') },
  { value: 'engage', label: __('SES Engage') }
];

const tableHeaders = {
  transaction: ['Subject', 'To', 'Cc', 'Bcc', 'From', 'Status', 'Created at'],
  engage: ['Customer id', 'Engage message id', 'Status', 'Created at']
};

function EmailDelivery({
  emailType,
  loading,
  count,
  list = [],
  handleSelectEmailType
}: Props) {
  const handleEmailtype = ({ value }: { value: string }) => {
    return handleSelectEmailType(value);
  };

  function renderItems() {
    if (emailType === EMAIL_TYPES.TRANSACTION) {
      return list.map(item => (
        <tr key={item._id}>
          <td>{item.subject || '-'}</td>
          <td>{item.to || '-'}</td>
          <td>{item.cc || '-'}</td>
          <td>{item.bcc || '-'}</td>
          <td>{item.from || '-'}</td>
          <td>{(item.status || '-').toUpperCase()}</td>
          <td>{dayjs(item.createdAt).format('LLL') || '-'}</td>
        </tr>
      ));
    }

    return list.map(item => (
      <tr key={item._id}>
        <td>{item.customerId || '-'}</td>
        <td>{item.engageMessageId || '-'}</td>
        <td>{item.status || '-'}</td>
        <td>{dayjs(item.createdAt).format('LLL') || '-'}</td>
      </tr>
    ));
  }

  function renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            {tableHeaders[emailType].map((item, idx) => (
              <th key={idx}>{__(item)}</th>
            ))}
          </tr>
        </thead>
        <tbody>{renderItems()}</tbody>
      </Table>
    );
  }

  function renderActionBar() {
    const content = (
      <FilterWrapper>
        <FilterItem>
          <Select
            placeholder={__('Choose Email type')}
            value={emailType}
            options={emailTypeOptions}
            onChange={handleEmailtype}
            resetValue=""
          />
        </FilterItem>
      </FilterWrapper>
    );

    return <Wrapper.ActionBar background="colorWhite" left={content} />;
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
