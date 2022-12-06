import Button from '@erxes/ui/src/components/Button';
import { IMobinet, IType } from '../types';
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
  mobinets: IMobinet[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (mobinet: IMobinet) => void;
  edit: (mobinet: IMobinet) => void;
  loading: boolean;
};

function List({
  mobinets,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'AddMobinetButton'} btnStyle="success" icon="plus-circle">
      Add Mobinet
    </Button>
  );

  const modalContent = props => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      mobinets={mobinets}
    />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add mobinet')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('Mobinet')}</Title>;

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
      <tbody id={'MobinetsShowing'}>
        {mobinets.map(mobinet => {
          return (
            <Row
              space={0}
              key={mobinet._id}
              mobinet={mobinet}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              mobinets={mobinets}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Mobinets" */ '../containers/SideBarList'
    )
  );

  const breadcrumb = [{ title: __('Mobinet'), link: '/mobinets' }];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Mobinet')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={mobinets.length}
          emptyText={__('Theres no mobinet')}
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
