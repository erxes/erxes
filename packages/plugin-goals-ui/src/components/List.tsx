import Button from '@erxes/ui/src/components/Button';
import { IGoals, IType } from '../types';
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
  goalss: IGoals[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (goals: IGoals) => void;
  edit: (goals: IGoals) => void;
  loading: boolean;
};

function List({
  goalss,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'AddGoalsButton'} btnStyle="success" icon="plus-circle">
      Add Goals
    </Button>
  );

  const modalContent = props => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      goalss={goalss}
    />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add goals')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('Goals')}</Title>;

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
      <tbody id={'GoalssShowing'}>
        {goalss.map(goals => {
          return (
            <Row
              space={0}
              key={goals._id}
              goals={goals}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              goalss={goalss}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(/* webpackChunkName: "List - Goalss" */ '../containers/SideBarList')
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Goalss'), link: '/goalss' }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Goalss')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={goalss.length}
          emptyText={__('Theres no goals')}
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
