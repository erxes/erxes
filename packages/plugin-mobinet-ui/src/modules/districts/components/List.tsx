import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { submenu } from '../../../utils';

import DistrictForm from '../containers/Form';
import Sidebar from './Sidebar';
import { IDistrict } from '../types';
import Row from './Row';

type Props = {
  districts: IDistrict[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (districtId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, districts, remove } = props;

  const renderRow = () => {
    const { districts } = props;
    return districts.map(district => (
      <Row key={district._id} district={district} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add district
    </Button>
  );

  const formContent = props => <DistrictForm {...props} />;

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="district"
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
          <th>{__('city')}</th>
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
          title={__('Districts')}
          queryParams={queryParams}
          submenu={submenu}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      leftSidebar={<Sidebar loadingMainQuery={loading} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={districts.length}
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
