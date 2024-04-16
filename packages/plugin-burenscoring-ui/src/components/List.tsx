import Button from '@erxes/ui/src/components/Button';
import { IBurenscoring, IType } from '../types';
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
  burenscorings: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (burenscoring: IBurenscoring) => void;
  edit: (burenscoring: IBurenscoring) => void;
  loading: boolean;
};

function List({
  burenscorings,
  remove,
  renderButton,
  loading,
  edit
}: Props) {
  const trigger = (
    <Button id={'AddBurenscoringButton'} btnStyle="success" icon="plus-circle">
      Add Burenscoring
    </Button>
  );



  const title = <Title capitalize={true}>{__('Burenscoring')}</Title>;



  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('score')}</th>
          <th>{__('firstname')}</th>
          <th>{__('registerno')}</th>
          <th>{__('Type')}</th>
          <th>{__('loans')}</th>
        </tr>
      </thead>
      <tbody id={'BurenscoringsShowing'}>
        {burenscorings.map(burenscoring => {
          return (
            <Row
              space={0}
              key={burenscoring._id}
              burenscoring={burenscoring}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              burenscorings={burenscorings}
            />
          );
        })}
      </tbody>
    </Table>
  );

 

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Burenscorings'), link: '/burenscorings' }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Burenscorings')} breadcrumb={breadcrumb} />}
     
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={burenscorings.length}
          emptyText={__('Theres no burenscoring')}
          emptyImage="/images/actions/8.svg"
        />
      }
      hasBorder
    />
  );
}

export default List;
