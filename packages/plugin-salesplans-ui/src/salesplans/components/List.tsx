import React from 'react';
import RowContainer from '../containers/Row';
import { __, DataWithLoader, EmptyState, Table } from '@erxes/ui/src';

type Props = {
  data: any[];
  loading: boolean;
  refetch: () => void;
};

const List = (props: Props) => {
  const { data, loading, refetch } = props;

  const renderRow = () =>
    data.map((item: any, index: number) => (
      <RowContainer key={index} data={item} refetch={refetch} />
    ));

  const renderTable = () => (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Type')}</th>
          <th>{__('Status')}</th>
          <th>{__('Branch')}</th>
          <th>{__('Department')}</th>
          <th>{__('Created by')}</th>
          <th>{__('Created at')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <DataWithLoader
      loading={loading}
      count={data ? data.length : 0}
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
};

export default List;
