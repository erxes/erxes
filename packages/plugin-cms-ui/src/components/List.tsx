import Button from '@erxes/ui/src/components/Button';
import { ICms, IType } from '../types';
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
  cmss: ICms[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (cms: ICms) => void;
  edit: (cms: ICms) => void;
  loading: boolean;
};

function List({
  cmss,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'AddCmsButton'} btnStyle="success" icon="plus-circle">
      Add Cms
    </Button>
  );

  const modalContent = props => (
    <Form {...props} types={types} renderButton={renderButton} cmss={cmss} />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add cms')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('Cms')}</Title>;

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
      <tbody id={'CmssShowing'}>
        {cmss.map(cms => {
          return (
            <Row
              space={0}
              key={cms._id}
              cms={cms}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              cmss={cmss}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(/* webpackChunkName: "List - Cmss" */ '../containers/SideBarList')
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Cmss'), link: '/cmss' }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Cmss')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={cmss.length}
          emptyText={__('Theres no cms')}
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
