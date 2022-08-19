import React from 'react';
import { __, Table, DataWithLoader, EmptyState } from '@erxes/ui/src';
import Row from './Row';

type Props = {
  loading: boolean;
  data: any[];
};

const List = (props: Props) => {
  const { loading = false, data = [] } = props;

  const renderRow = () =>
    data.map((item: any, index: number) => <Row key={index} data={item} />);

  const renderTable = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Branch')}</th>
            <th>{__('Department')}</th>
            <th>{__('Content Type')}</th>
            <th>{__('Created at')}</th>
            <th>{__('Created by')}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  return (
    <DataWithLoader
      loading={loading}
      count={data.length}
      data={renderTable()}
      emptyText="No transactions"
      emptyImage="/images/actions/5.svg"
    />
  );
};

export default List;
