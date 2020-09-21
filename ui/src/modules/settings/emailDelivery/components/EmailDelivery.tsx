import dayjs from 'dayjs';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { FormControl } from 'modules/common/components/form';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { FilterItem, FilterWrapper } from 'modules/settings/permissions/styles';
import * as React from 'react';
import Select from 'react-select-plus';
import { EMAIL_TYPES } from '../containers/EmailDelivery';

type Props = {
  list: any;
  history: any;
  searchValue?: string;
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
  { value: 'transaction', label: __('Transaction') },
  { value: 'engage', label: __('SES Engage') }
];

const tableHeaders = {
  transaction: ['Subject', 'To', 'Cc', 'Bcc', 'From', 'Status', 'Created at'],
  engage: ['Customer id', 'Title', 'Status', 'Created at']
};

function EmailDelivery({
  emailType,
  loading,
  count,
  list = [],
  handleSelectEmailType,
  searchValue,
  history
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

  function renderItems() {
    if (!emailType) {
      return null;
    }

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
        <td>{item.engage ? item.engage.title : '-'}</td>
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
            {(tableHeaders[emailType] || []).map((item, idx) => (
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
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={handleSearch}
          value={search}
        />

        <FilterItem>
          <Select
            placeholder={__('Choose Email type')}
            value={emailType}
            options={emailTypeOptions}
            onChange={handleEmailtype}
            resetValue={[]}
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
