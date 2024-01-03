import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import { tumentechMenu } from '../list/CarsList';
import Row from './Row';

type Props = {
  accounts: any[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  //   remove: (directionId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, accounts } = props;

  const renderRow = () => {
    return accounts.map(account => <Row key={account._id} account={account} />);
  };

  queryParams.loadingMainQuery = loading;

  // const actionBarRight = (
  //   <Link to="/forms/create">
  //     <Button btnStyle="success" size="small" icon="plus-circle">
  //       Add direction
  //     </Button>
  //   </Link>
  // );

  //   const trigger = (
  //     <Button btnStyle="success" size="small" icon="plus-circle">
  //       Add direction
  //     </Button>
  //   );

  //   const formContent = formProps => <DirectionForm {...formProps} />;

  //   const righActionBar = (
  //     <ModalTrigger
  //       size="lg"
  //       title="Direction"
  //       autoOpenKey="showAppAddModal"
  //       trigger={trigger}
  //       content={formContent}
  //     />
  //   );

  //   const actionBar = (
  //     <Wrapper.ActionBar right={righActionBar} />
  //   );

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Customer')}</th>
          <th>{__('Balance')}</th>
          <th>{__('Profile')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Accounts')}
          queryParams={queryParams}
          submenu={tumentechMenu}
        />
      }
      //   actionBar={actionBar}
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
