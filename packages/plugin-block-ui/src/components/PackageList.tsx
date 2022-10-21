import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import PackageForm from './PackageForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Row from './Row';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import { IPackage } from '../types';

type Props = {
  packages: IPackage[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (item: IPackage) => void;
  loading: boolean;
};

function List({ packages, remove, loading, renderButton }: Props) {
  const trigger = (
    <Button id={'AddPackage'} btnStyle="success" icon="plus-circle">
      Add package
    </Button>
  );

  const modalContent = props => (
    <PackageForm {...props} renderButton={renderButton} />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add package')}
      autoOpenKey={`showModal`}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={'Packages'}
      right={actionBarRight}
      wideSpacing={true}
    />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Description')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'TagsShowing'}>
        {packages.map(item => {
          return (
            <Row
              key={item._id}
              item={item}
              removeItem={remove}
              renderButton={renderButton}
            />
          );
        })}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={'Packages'} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={packages.length}
          emptyText={__('There is no tag') + '.'}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}

export default List;
