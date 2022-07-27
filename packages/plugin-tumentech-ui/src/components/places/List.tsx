import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import Row from './Row';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import PlaceForm from '../../containers/places/Form';
import { tumentechMenu } from '../list/CarsList';
import { IPlace } from '../../types';

type Props = {
  places: IPlace[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (placeId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, places, remove } = props;

  const renderRow = () => {
    const { places } = props;
    return places.map(place => (
      <Row key={place._id} place={place} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  // const actionBarRight = (
  //   <Link to="/forms/create">
  //     <Button btnStyle="success" size="small" icon="plus-circle">
  //       Add direction
  //     </Button>
  //   </Link>
  // );

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add place
    </Button>
  );

  const formContent = props => <PlaceForm {...props} />;

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="place"
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
          <th>{__('Province')}</th>
          <th>{__('Code')}</th>
          <th>{__('Name')}</th>
          <th>{__('Latitude')}</th>
          <th>{__('Longitude')}</th>
          <th>{__('Description')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Places')}
          queryParams={queryParams}
          submenu={tumentechMenu}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={places.length}
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
