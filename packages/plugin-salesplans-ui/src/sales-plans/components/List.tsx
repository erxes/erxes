import React from 'react';
import { Link } from 'react-router-dom';
import { __, Wrapper, Table, Button, DataWithLoader } from '@erxes/ui/src';
import Sidebar from '../containers/Sidebar';

const List = () => {
  const actionBarRight = (
    <Link to="/sales-plans/create">
      <Button size="small" icon="plus-circle">
        Add Data
      </Button>
    </Link>
  );

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Status')}</th>
          <th>{__('Created By')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Dummy name</td>
          <td>Dummy status</td>
          <td>Dummy created by</td>
          <td>Dummy actions</td>
        </tr>
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Sales Plans')}
          breadcrumb={[{ title: __('Sales Plans') }]}
        />
      }
      leftSidebar={<Wrapper.Sidebar children={<Sidebar />} />}
      actionBar={<Wrapper.ActionBar right={actionBarRight} />}
      content={<DataWithLoader data={content} loading={false} />}
    />
  );
};

export default List;
