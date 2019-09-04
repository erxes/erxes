import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { IProduct } from '../types';
import Form from './Form';
import Row from './Row';

type Props = {
  products: IProduct[];
  productsCount: number;
  remove: (productId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loading: boolean;
};

class List extends React.Component<Props> {
  renderRow = () => {
    const { products, remove, renderButton } = this.props;

    return products.map(product => (
      <Row
        key={product._id}
        product={product}
        remove={remove}
        renderButton={renderButton}
      />
    ));
  };

  render() {
    const { productsCount, loading, renderButton } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service') }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        Add Product / Service
      </Button>
    );

    const modalContent = props => (
      <Form {...props} renderButton={renderButton} />
    );

    const actionBarRight = (
      <ModalTrigger
        title="Add Product / Service"
        trigger={trigger}
        content={modalContent}
      />
    );

    const content = (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Type')}</th>
            <th>{__('Description')}</th>
            <th>{__('SKU')}</th>
            <th />
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Product & Service')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/30.svg"
                title={'Product & Service'}
                description={`All information and know-how related to your business's products and services are found here. Create and add in unlimited products and servicess so that you and your team members can edit and share.`}
              />
            }
            right={actionBarRight}
          />
        }
        footer={<Pagination count={productsCount} />}
        center={true}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={productsCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
      />
    );
  }
}

export default List;
