import Button from '@erxes/ui/src/components/Button';
import { IReports, IType } from '../types';
import Row from './Row';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Form from './Form';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Chart, { ChartType } from './chart/Chart';
import { Label } from '@erxes/ui/src/components/form/styles';

type Props = {
  reports: any;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  remove?: (reports: IReports) => void;
  edit?: (reports: IReports) => void;
  loading: boolean;
};

function List({ reports, remove, renderButton, loading, edit }: Props) {
  const trigger = (
    <Button id={'AddReportsButton'} btnStyle="success" icon="plus-circle">
      Add Reports
    </Button>
  );

  // const modalContent = props => (
  //   <Form
  //     {...props}
  //     types={types}
  //     renderButton={renderButton}
  //     reports={reports}
  //   />
  // );

  // const actionBarRight = (
  //   <ModalTrigger
  //     title={__('Add reports')}
  //     trigger={trigger}
  //     content={modalContent}
  //     enforceFocus={false}
  //   />
  // );

  const title = <Title capitalize={true}>{__('Reports')}</Title>;

  const actionBar = <Wrapper.ActionBar left={title} wideSpacing />;

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Todo')}</th>
          <th>{__('Expiry Date')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'ReportsShowing'}>
        {/* {reports.map(reports => {
          return (
            <Row
              space={0}
              key={reports._id}
              reports={reports}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              reports={reports}
              types={types}
            />
          );
        })} */}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(/* webpackChunkName: "List - Reports" */ '../containers/SideBarList')
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Reports'), link: '/reports' }
  ];

  return (
    <Chart
      data={[1, 2, 3, 4, 5, 6]}
      labels={['a', 'b', 'c', 'd', 'e', 'f']}
      chartType={ChartType.BAR}
      name="Bar Chart"
    />
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Reports')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={reports.length}
          emptyText={__('Theres no reports')}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      leftSidebar={<SideBarList />}
      hasBorder
    />
  );
}

export default List;
