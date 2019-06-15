import {
  Button,
  DataWithLoader,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IProduct } from '../types';
import { Form, Row } from './';

type Doc = {
  type: string;
  _id?: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
};

type Props = {
  products: IProduct[];
  productsCount: number;
  remove: (productId: string) => void;
  save: (doc: Doc, callback: () => void, product?: IProduct) => void;
  loading: boolean;
};

class List extends React.Component<Props> {
  renderRow = () => {
    const { products, remove, save } = this.props;

    return products.map(product => (
      <Row key={product._id} product={product} remove={remove} save={save} />
    ));
  };

  render() {
    const { save, productsCount, loading } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service') }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        Add Product / Service
      </Button>
    );

    const modalContent = props => <Form {...props} save={save} />;

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
