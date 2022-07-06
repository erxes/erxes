import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import Row from './Row';
import { tumentechMenu } from '../list/CarsList';
import { ITrip } from '../../types';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  trips: ITrip[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, trips } = props;

  const renderRow = () => {
    return trips.map(trip => <Row key={trip._id} trip={trip} />);
  };

  queryParams.loadingMainQuery = loading;

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Route name')}</th>
          <th>{__('Status')}</th>
          <th>{__('Driver')}</th>
          <th>{__('Car info')}</th>
          <th>{__('Deals')}</th>
          <th>{__('Created at')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Trips')}
          queryParams={queryParams}
          submenu={tumentechMenu}
        />
      }
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={totalCount}
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
