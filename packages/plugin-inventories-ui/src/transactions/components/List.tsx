import React from 'react';
// erxes
import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import EmptyState from '@erxes/ui/src/components/EmptyState';
// local
import Row from './Row';
import { SUBMENU } from '../../constants';

type Props = {
  loading: boolean;
  data: any[];
};

const List = (props: Props) => {
  const { loading = false, data = [] } = props;

  const renderRow = () =>
    data.map((item: any, index: number) => <Row key={index} data={item} />);

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Branch')}</th>
          <th>{__('Department')}</th>
          <th>{__('Content Type')}</th>
          <th>{__('Created at')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Transactions')} submenu={SUBMENU} />}
      footer={<Pagination count={data.length || 0} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={data.length}
          emptyContent={
            <EmptyState
              image="/images/actions/5.svg"
              text="No transactions"
              size=""
            />
          }
        />
      }
    />
  );
};

export default List;
