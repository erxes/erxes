import React from 'react';
import { __, DataWithLoader, EmptyState, Table } from '@erxes/ui/src';

const List = () => {
  const loading = false;
  const data = [];

  const renderRow = () =>
    data.map((item: any, index: number) => {
      <></>;
    });

  const renderTable = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Description')}</th>
            <th>{__('Status')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Created at')}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  return (
    <DataWithLoader
      loading={loading}
      count={0}
      data={renderTable()}
      emptyContent={
        <EmptyState
          image="/images/actions/12.svg"
          text="No transactions"
          size=""
        />
      }
    />
  );
};

export default List;
