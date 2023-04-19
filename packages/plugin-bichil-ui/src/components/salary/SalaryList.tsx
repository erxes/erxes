import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import Form from '../../containers/salary/Form';

// import { IKhanbankConfigsItem } from '../types';
import Row from './Row';

type Props = {
  salaries?: any[];
  totalCount?: number;
  queryParams?: any;
  loading?: boolean;
  remove?: (id: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, salaries = [], remove } = props;

  const renderRow = () => {
    return salaries.map(salary => (
      <Row key={salary._id} salary={salary} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Import salary report
    </Button>
  );

  const formContent = formProps => <Form {...formProps} />;

  const righActionBar = (
    <ModalTrigger
      size="sm"
      title="Import salary report"
      autoOpenKey="showAppAddModal"
      trigger={trigger}
      content={formContent}
    />
  );

  const actionBar = <Wrapper.ActionBar right={righActionBar} />;

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Bichil Globus'), link: '/settings/bichil' }
  ];

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('name')}</th>
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
          title={__('Bichil Globus Salary details')}
          breadcrumb={breadcrumb}
          queryParams={queryParams}
          //   submenu={submenu}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/27.svg"
          title={'Bichil Globus Salary details'}
          description={__(`Bichil Globus Salary details`)}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading || false}
          count={totalCount}
          emptyContent={
            <EmptyContent
              content={{
                title: __('No data found'),
                description: __('No data found')
              }}
              maxItemWidth="360px"
            />
          }
        />
      }
      hasBorder={true}
    />
  );
};

export default List;
