import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import Form from '../containers/Form';
import Row from './Row';

type Props = {
  clients: any[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  page: number;
  perPage: number;
  remove: (id: string) => void;
  refetch?: any;
};

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Apps') },
];

const List = (props: Props) => {
  const { totalCount, queryParams, loading, clients, remove, refetch } = props;

  const renderRow = () => {
    const { clients } = props;
    return clients.map((client, i) => (
      <Row
        index={(props.page - 1) * props.perPage + i + 1}
        key={client._id}
        client={client}
        remove={remove}
        refetch={refetch}
      />
    ));
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle='success' size='small' icon='plus-circle'>
      New app
    </Button>
  );

  const formContent = (formProps) => <Form {...formProps} refetch={refetch}/>;

  const righActionBar = (
    <ModalTrigger
      size='xl'
      title='Application'
      autoOpenKey='showAppAddModal'
      trigger={trigger}
      content={formContent}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={actionBarLeft} />
  );

  const content = (
    <Table $whiteSpace='nowrap' $hover={true}>
      <thead>
        <tr>
          <th>{__('App name')}</th>
          <th>{__('Client ID')}</th>
          <th>{__('Secret')}</th>
          <th>{__('Created at')}</th>
          <th>{__('Action')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Apps')}
          queryParams={queryParams}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={clients.length}
          emptyContent={
            <h3
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {__('No apps found')}
            </h3>
          }
        />
      }
    />
  );
};

export default List;
