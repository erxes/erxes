import React from 'react';
// erxes
import { __ } from '@erxes/ui/src/utils';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';
// local
import Row from '../../containers/plan/Row';

type Props = {
  data: any[];
  loading: boolean;
};

export default function List(props: Props) {
  const { data, loading } = props;

  // Functions
  const renderRow = () =>
    data.map((item: any, index: number) => (
      <Row key={`pricing-row-${index}`} data={item} />
    ));

  const renderTable = () => (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Status')}</th>
          <th>{__('Created by')}</th>
          <th>{__('Created at')}</th>
          <th>{__('Last updated at')}</th>
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
          image="/images/actions/5.svg"
          text="No pricing plans"
          size=""
        />
      }
    />
  );
}
