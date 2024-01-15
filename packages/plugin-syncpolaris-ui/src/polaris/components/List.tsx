import Button from '@erxes/ui/src/components/Button';
import { ISyncpolaris, IType } from '../types';
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
  syncpolariss: ISyncpolaris[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (syncpolaris: ISyncpolaris) => void;
  edit: (syncpolaris: ISyncpolaris) => void;
  loading: boolean;
};

function List({
  syncpolariss,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'AddSyncpolarisButton'} btnStyle="success" icon="plus-circle">
      Add Syncpolaris
    </Button>
  );

  const modalContent = props => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      syncpolariss={syncpolariss}
    />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add syncpolaris')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('Syncpolaris')}</Title>;

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
      <tbody id={'SyncpolarissShowing'}>
        {syncpolariss.map(syncpolaris => {
          return (
            <Row
              space={0}
              key={syncpolaris._id}
              syncpolaris={syncpolaris}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              syncpolariss={syncpolariss}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Syncpolariss" */ '../containers/SideBarList'
    )
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Syncpolariss'), link: '/syncpolariss' }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Syncpolariss')} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={syncpolariss.length}
          emptyText={__('Theres no syncpolaris')}
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
