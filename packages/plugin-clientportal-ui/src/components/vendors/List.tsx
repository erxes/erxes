import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

// import DirectionForm from '../../containers/directions/Form';
// import { IDirection } from '../../types';
// import { tumentechMenu } from '../list/CarsList';
import Row from './Row';

type Props = {
  //   directions: IDirection[];
  //   totalCount: number;
  queryParams: any;
  //   loading: boolean;
  //   remove: (directionId: string) => void;
  //   refetch?: () => void;
};

const List = (props: Props) => {
  //   const { totalCount, queryParams, loading, directions, remove } = props;

  const renderRow = () => {
    const testData = [
      {
        companyName: 'company 1',
        industry: 'Automobiles',
        phone: '99112233',
        email: 'company1@mail.com'
      },
      {
        companyName: 'company 2',
        industry: 'Properties',
        phone: '88112233',
        email: 'info@company2.com'
      }
    ];
    return testData.map(direction => (
      <Row key={Math.random()} direction={direction} />
    ));
  };

  //   queryParams.loadingMainQuery = loading;

  // const actionBarRight = (
  //   <Link to="/forms/create">
  //     <Button btnStyle="success" size="small" icon="plus-circle">
  //       Add direction
  //     </Button>
  //   </Link>
  // );

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add direction
    </Button>
  );

  const formContent = formProps => <>content</>;

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="Direction"
      autoOpenKey="showAppAddModal"
      trigger={trigger}
      content={formContent}
    />
  );

  const actionBar = <Wrapper.ActionBar right={righActionBar} />;

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Company name')}</th>
          <th>{__('Industry')}</th>
          <th>{__('Phone')}</th>
          <th>{__('Email')}</th>

          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    // <Wrapper
    //   header={
    //     <Wrapper.Header
    //       title={__('Directions')}
    //       queryParams={queryParams}
    //       submenu={tumentechMenu}
    //     />
    //   }
    //   actionBar={actionBar}
    //   footer={<Pagination count={totalCount} />}
    //   content={
    //     <DataWithLoader
    //       data={content}
    //       loading={loading}
    //       count={directions.length}
    //       emptyContent={
    //         <h3
    //           style={{
    //             display: 'flex',
    //             justifyContent: 'center',
    //             alignItems: 'center'
    //           }}
    //         >
    //           no data
    //         </h3>
    //       }
    //     />
    //   }
    // />

    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Company name')}</th>
          <th>{__('Industry')}</th>
          <th>{__('Phone')}</th>
          <th>{__('Email')}</th>

          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
};

export default List;
