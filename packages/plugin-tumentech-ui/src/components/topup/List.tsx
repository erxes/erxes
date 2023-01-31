import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import Form from '../../containers/topup/Form';
import Row from './Row';

type Props = {
  topups: any[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, topups } = props;

  const renderRow = () => {
    const { topups } = props;
    return topups.map(topup => <Row key={topup._id} topup={topup} />);
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Topup account
    </Button>
  );

  const formContent = props => <Form {...props} />;

  const righActionBar = (
    <ModalTrigger
      size="sm"
      title="Topup customer account"
      autoOpenKey="topupModal"
      trigger={trigger}
      content={formContent}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={actionBarLeft} />
  );

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('customer')}</th>
          <th>{__('amount')}</th>
          <th>{__('createdAt')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Topups')}
          queryParams={queryParams}
          breadcrumb={[
            { title: __('Home'), link: '/' },
            { title: __('Topup history') }
          ]}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={topups.length}
          emptyContent={
            <h3
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              no data
            </h3>
          }
        />
      }
    />
  );
};

export default List;
