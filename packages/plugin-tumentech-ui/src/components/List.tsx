import Button from '@erxes/ui/src/components/Button';
import { ITumentech, IType } from '../types';
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
  tumentechs: ITumentech[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (tumentech: ITumentech) => void;
  edit: (tumentech: ITumentech) => void;
  loading: boolean;
};

function List({
  tumentechs,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'AddTumentechButton'} btnStyle="success" icon="plus-circle">
      Add Tumentech
    </Button>
  );

  const modalContent = props => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      tumentechs={tumentechs}
    />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add tumentech')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('Tumentech')}</Title>;

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
      <tbody id={'TumentechsShowing'}>
        {tumentechs.map(tumentech => {
          return (
            <Row
              space={0}
              key={tumentech._id}
              tumentech={tumentech}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              tumentechs={tumentechs}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Tumentechs" */ '../containers/SideBarList'
    )
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Tumentechs'), link: '/tumentechs' }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Tumentechs')} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={tumentechs.length}
          emptyText={__('Theres no tumentech')}
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
