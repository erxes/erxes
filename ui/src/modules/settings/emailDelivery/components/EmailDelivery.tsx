import DataWithLoader from 'modules/common/components/DataWithLoader';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __, router } from 'modules/common/utils';
import { IEmailDelivery } from 'modules/engage/types';
import Wrapper from 'modules/layout/components/Wrapper';
import { FilterItem, FilterWrapper } from 'modules/settings/permissions/styles';
import * as React from 'react';
import Select from 'react-select-plus';

type Props = {
  loading: boolean;
  count: number;
  history: any;
  transactionDeliveries: IEmailDelivery[];
};

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Email deliveries') }
];

const statusOptions = [
  { value: 'pending', label: __('Pending') },
  { value: 'received', label: __('Received') }
];

function EmailDelivery(props: Props) {
  const { history, loading, count, transactionDeliveries } = props;

  const [statusType, setStatusType] = React.useState('');

  const handleChangeStatus = ({ value }: { value: string }) => {
    setStatusType(value);

    return router.setParams(history, { status: value });
  };

  function renderItems() {
    return transactionDeliveries.map(item => (
      <tr key={item._id}>
        <td>{item.subject || '-'}</td>
        <td>{(item.status || '').toUpperCase()}</td>
        <td>{item.createdAt}</td>
      </tr>
    ));
  }

  function renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            <th>{__('Subject')}</th>
            <th>{__('Status')}</th>
            <th>{__('Created at')}</th>
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
            placeholder={__('Choose status')}
            value={statusType}
            options={statusOptions}
            onChange={handleChangeStatus}
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
          title={__('Email deliveries')}
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
          emptyText={__('There are no email delivery logs')}
          emptyImage="/images/actions/21.svg"
        />
      }
    />
  );
}

export default EmailDelivery;
