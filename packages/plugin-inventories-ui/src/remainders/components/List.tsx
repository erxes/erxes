import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Table from '@erxes/ui/src/components/table';
import { Title } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import { IRemainder } from '../types';
import FormComponent from '@erxes/ui/src/tags/components/Form';

type Props = {
  remianders: IRemainder[];
  loading: boolean;
};

function List({ remianders, loading }: Props) {
  const trigger = (
    <Button id={'AddTagButton'} btnStyle="success" icon="plus-circle">
      Add tag
    </Button>
  );

  const modalContent = props => (
    <FormComponent {...props} remianders={remianders} />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add tag')}
      autoOpenKey={`showTagRemaindersModal`}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('remianders')}</Title>;
  const actionBar = <Wrapper.ActionBar left={title} right={actionBarRight} />;

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Total item counts')}</th>
          <th>{__('Item counts')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'RemaindersShowing'}>
        {remianders.map(rem => {
          return <Row key={rem._id} remainder={rem} />;
        })}
      </tbody>
    </Table>
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Remainders'), link: '/remianders' }
  ];
  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('remainders')} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={remianders.length}
          emptyText={__('There is no tag') + '.'}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<Sidebar />}
      hasBorder={true}
      transparent={true}
    />
  );
}

export default List;
