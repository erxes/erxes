import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';

import WithPermission from 'coreui/withPermission';
import React from 'react';
import Form from '../../containers/salary/Form';
import Row from './Row';
import { Formgroup } from '@erxes/ui/src/components/form/styles';

type Props = {
  salaries?: any[];
  labels: any;
  totalCount?: number;
  queryParams?: any;
  loading?: boolean;
  isEmployeeSalary?: boolean;
  remove?: (id: string) => void;
  refetch?: () => void;
  confirmPassword?: () => void;
};

const List = (props: Props) => {
  const {
    totalCount,
    queryParams,
    loading,
    salaries = [],
    labels = {}
  } = props;
  const keys = Object.keys(labels).filter(key => key !== 'title');

  const renderRow = () => {
    return salaries.map(salary => (
      <Row key={salary._id} salary={salary} keys={keys} />
    ));
  };

  const renderButton = (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Formgroup>
        <ControlLabel>Salaries</ControlLabel>
        <p>Confirm password to see salary details</p>
        <Button
          btnStyle="success"
          size="small"
          icon="eye"
          onClick={props.confirmPassword}
        >
          See salary details
        </Button>
      </Formgroup>
    </div>
  );

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

  const actionBar = (
    <WithPermission action="addSalaries">
      <Wrapper.ActionBar right={righActionBar} />
    </WithPermission>
  );

  const breadcrumb = props.isEmployeeSalary
    ? [
        { title: __('Profile'), link: '/profile' },
        { title: __('Salary detail'), link: '/profile/salaries/bichil' }
      ]
    : [
        { title: __('Settings'), link: '/settings' },
        { title: __('Bichil Globus'), link: '/settings/bichil' }
      ];

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>title</th>
          <th>Салбар/нэгж</th>
          <th>Албан тушаал</th>
          <th>Овог нэр</th>
          {keys.map(key => (
            <th key={key}>{labels[key]}</th>
          ))}
          {/*
            TODO: discuss with bichil then implement this
          <th>{__('Action')}</th> */}
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  const emptyTitle = props.isEmployeeSalary
    ? 'Confirmation required'
    : 'No data';
  const emptyDescription = props.isEmployeeSalary
    ? 'Please confirm your password to view salary details'
    : 'There is no data to display or you do not have permission to view it';
  const steps: any[] = [];

  if (props.isEmployeeSalary) {
    steps.push({
      title: 'Confirm password',
      description: 'Please confirm your password to view salary details',
      content: <div>triggeeer</div>
    });
  }

  const emptyContent = (
    <EmptyContent
      content={{
        title: emptyTitle,
        description: emptyDescription,
        steps
      }}
      maxItemWidth="360px"
    />
  );

  return (
    <>
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Bichil Globus Salary details')}
            breadcrumb={breadcrumb}
            queryParams={queryParams}
          />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/27.svg"
            title={'Bichil Globus Salary details'}
            description={__(`Bichil Globus Salary details`)}
          />
        }
        actionBar={props.isEmployeeSalary ? null : actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading || false}
            count={totalCount}
            emptyContent={props.isEmployeeSalary ? renderButton : emptyContent}
          />
        }
        hasBorder={true}
      />
    </>
  );
};

export default List;
