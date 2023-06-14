import Button from '@erxes/ui/src/components/Button';
import { IAd } from '../types';
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
import Pagination from '@erxes/ui/src/components/pagination/Pagination';

type Props = {
  ads: IAd[];
  totalCount: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (ad: IAd) => void;
  edit: (ad: IAd) => void;
  loading: boolean;
};

function List({ ads, totalCount, remove, renderButton, loading, edit }: Props) {
  const trigger = (
    <Button id={'AddAdButton'} btnStyle="success" icon="plus-circle">
      Add Ad
    </Button>
  );

  const modalContent = props => (
    <Form {...props} renderButton={renderButton} ads={ads} />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add ad')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = <Title capitalize={true}>{__('Ad')}</Title>;

  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing={true} />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Type')}</th>
          <th>{__('Title')}</th>
          <th>{__('Mark')}</th>
          <th>{__('Model')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'AdsShowing'}>
        {ads.map(ad => {
          return (
            <Row
              space={0}
              key={ad._id}
              ad={ad}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              ads={ads}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Ads'), link: '/ads' }
  ];
  return (
    <Wrapper
      header={<Wrapper.Header title={__('Ads')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={totalCount}
          emptyText={__('Theres no ad')}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      hasBorder={true}
      footer={<Pagination count={totalCount} />}
    />
  );
}

export default List;
