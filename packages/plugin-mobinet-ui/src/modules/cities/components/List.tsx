import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { submenu } from '../../../utils';

import CityForm from '../containers/Form';

import { ICity } from '../types';
import Row from './Row';

type Props = {
  cities: ICity[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (cityId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, cities, remove } = props;

  const renderRow = () => {
    const { cities } = props;
    return cities.map(city => (
      <Row key={city._id} city={city} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add city
    </Button>
  );

  const formContent = props => <CityForm {...props} />;

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="city"
      autoOpenKey="showAppAddModal"
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
          <th>{__('code')}</th>
          <th>{__('name')}</th>
          <th>{__('Latitude')}</th>
          <th>{__('Longitude')}</th>
          <th>{__('iso')}</th>
          <th>{__('stat')}</th>
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
          title={__('Cities')}
          queryParams={queryParams}
          submenu={submenu}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={cities.length}
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
