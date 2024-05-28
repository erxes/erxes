import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import RouteForm from '../../containers/routes/Form';
import { IRoute } from '../../types';
import { tumentechMenu } from '../list/CarsList';
import Row from './Row';

type Props = {
  routes: IRoute[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (routeId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, routes, remove } = props;

  const renderRow = () => {
    const { routes } = props;
    return routes.map(route => (
      <Row key={route._id} route={route} remove={remove} />
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
      Add route
    </Button>
  );

  const formContent = props => <RouteForm {...props} />;

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="Route"
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
          <th>{__('name')}</th>
          <th>{__('code')}</th>
          <th>{__('places')}</th>
          <th>{__('duration')}</th>
          <th>{__('distance (km)')}</th>
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
          title={__('Routes')}
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
          count={routes.length}
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
