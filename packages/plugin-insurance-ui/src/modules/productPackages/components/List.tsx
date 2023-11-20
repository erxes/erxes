import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import RiskForm from '../containers/Form';
// import { tumentechMenu } from '../list/CarsList';
import Row from './Row';
import { menu } from '../../../routes';
import { InsurancePackage, Risk } from '../../../gql/types';

type Props = {
  packages: InsurancePackage[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (id: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, packages, remove } = props;

  const renderRow = () => {
    return packages.map(p => (
      <Row key={p._id} insurancePackage={p} remove={remove} />
    ));
  };

  //   queryParams.loadingMainQuery = loading;
  //   const actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add package
    </Button>
  );

  const formContent = formProps => (
    <RiskForm {...formProps} refetch={props.refetch} />
  );

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="Add package"
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
          <th>{__('Name')}</th>
          <th>{__('Products')}</th>
          <th>{__('Last modified date')}</th>
          <th>{__('Last modified by')}</th>
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
          title={__('Packages')}
          queryParams={queryParams}
          submenu={menu}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={packages.length}
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
