import Button from '@erxes/ui/src/components/Button';
import { IReports, IType } from '../types';
import Row from './Row';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Form from './Form';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

type Props = {
  reportss: IReports[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (reports: IReports) => void;
  edit: (reports: IReports) => void;
  loading: boolean;
};

function List({
  reportss,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'AddReportsButton'} btnStyle="success" icon="plus-circle">
      Add Reports
    </Button>
  );

  const modalContent = props => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      reportss={reportss}
    />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add reports')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('Reports')}</Title>;

  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Todo')}</th>
          <th>{__('Expiry Date')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'ReportssShowing'}>
        {reportss.map(reports => {
          return (
            <Row
              space={0}
              key={reports._id}
              reports={reports}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              reportss={reportss}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Reportss" */ '../containers/SideBarList'
    )
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Reportss'), link: '/reportss' }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Reportss')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={reportss.length}
          emptyText={__('Theres no reports')}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<SideBarList currentTypeId={typeId} />}
      transparent={true}
      hasBorder
    />
  );
}

export default List;
