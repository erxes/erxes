import Button from '@erxes/ui/src/components/Button';
import { I{Name}, IType } from '../types';
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
  {name}s: I{Name}[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: ({name}: I{Name}) => void;
  edit: ({name}: I{Name}) => void;
  loading: boolean;
};

function List({
  {name}s,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'Add{Name}Button'} btnStyle="success" icon="plus-circle">
      Add {Name}
    </Button>
  );

  const modalContent = props => (
    <Form {...props} types={types} renderButton={renderButton} {name}s={{name}s} />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add {name}')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('{Name}')}</Title>;

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
      <tbody id={'{Name}sShowing'}>
        {{name}s.map({name} => {
          return (
            <Row
              space={0}
              key={{name}._id}
              {name}={{name}}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              {name}s={{name}s}
              types={types}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(/* webpackChunkName: "List - {Name}s" */ '../containers/SideBarList')
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('{Name}s'), link: '/{name}s' }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('{Name}s')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={{name}s.length}
          emptyText={__('Theres no {name}')}
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
