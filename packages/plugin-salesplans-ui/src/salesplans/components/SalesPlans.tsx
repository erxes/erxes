import React, { useState, useEffect } from 'react';
import { __, Wrapper, DataWithLoader, Table, EmptyState } from '@erxes/ui/src';
import RowContainer from '../containers/Row';
import ActionBarContainer from '../containers/ActionBar';

type Props = {
  data: any[];
  loading: boolean;
  refetch: () => void;
};

function List(props: Props) {
  const { data = [], loading = false, refetch } = props;

  const [salesLog, setSalesLog] = useState<any[]>(data);

  useEffect(() => setSalesLog(data), [data]);

  const renderRow = () => {
    return salesLog.map((item: any, index: number) => (
      <RowContainer key={index} data={item} refetch={refetch} />
    ));
  };

  const renderTable = () => (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Branch')}</th>
          <th>{__('Department')}</th>
          <th>{__('Type')}</th>
          <th>{__('Status')}</th>
          <th>{__('Created at')}</th>
          <th>{__('Created by')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      {renderRow()}
    </Table>
  );

  const renderContent = () => (
    <DataWithLoader
      loading={loading}
      count={salesLog ? salesLog.length : 0}
      data={renderTable()}
      emptyContent={
        <EmptyState
          image="/images/actions/12.svg"
          text="No Sale Logs"
          size=""
        />
      }
    />
  );

  const renderActionBar = () => (
    <Wrapper.ActionBar right={<ActionBarContainer refetch={refetch} />} />
  );

  const renderHeader = () => (
    <Wrapper.Header
      title={__('Sales Plans')}
      breadcrumb={[{ title: __('Sales Plans') }]}
    />
  );

  return (
    <Wrapper
      header={renderHeader()}
      content={renderContent()}
      actionBar={renderActionBar()}
    />
  );
}

export default List;
