import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __, router as routerUtils } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import Row from './Row';
import Form from './SubscriptionProductForm';
import { Title } from '@erxes/ui-settings/src/styles';
import { IProduct } from '../../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Flex } from '@erxes/ui/src/styles/main';
import { Filter } from '../../styles';
import Select from 'react-select-plus';
import { userTypes } from '../../constants';

type Props = {
  products: IProduct[];
  queryParams?: any;
  history?: any;
  onDelete?: (item: IProduct) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

export default function ProductList({
  products,
  onDelete,
  renderButton,
  queryParams,
  history
}: Props) {
  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    {
      title: __('Subscription Products'),
      link: '/forums/subscription-products'
    }
  ];

  const trigger = (
    <Button id={'AddProductButton'} btnStyle="success" icon="plus-circle">
      Add Product
    </Button>
  );

  const modalContent = props => (
    <Form onDelete={onDelete} renderButton={renderButton} {...props} />
  );

  const onStatusChange = (status: { label: string; value: boolean }) => {
    routerUtils.setParams(history, { userType: status.value });
  };

  const actionBarRight = (
    <Flex>
      <Filter>
        <Select
          placeholder={__('Choose user type')}
          value={queryParams.userType}
          onChange={onStatusChange}
          clearable={false}
          options={userTypes}
        />
      </Filter>
      <ModalTrigger
        title={__('Add Product')}
        autoOpenKey={`showSubscriptionProductModal`}
        trigger={trigger}
        size="lg"
        content={modalContent}
        enforceFocus={false}
      />
    </Flex>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={<Title capitalize={true}>{__('Subscription Products')}</Title>}
      right={actionBarRight}
    />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Multiplier</th>
          <th>Unit</th>
          <th>Price</th>
          <th>User type</th>
          <th>List order</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'ProductList'}>
        {products.map((product: any) => {
          return (
            <Row
              key={product._id}
              onDelete={onDelete}
              renderButton={renderButton}
              product={product}
            />
          );
        })}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Subscription Products')}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={products.length}
          emptyText={__('There is no product') + '.'}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}
