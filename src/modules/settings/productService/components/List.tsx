import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination,
  Table
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import React, { Component } from 'react';
import { IProduct } from '../types';
import { Form, Row } from './';

type Props = {
  products: IProduct[],
  productsCount: number,
  remove: (_id: string) => void,
  save: ({ doc }: { doc: any; }, callback: () => void, product: IProduct) => void,
  loading: boolean
};

class List extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    this.renderEditForm = this.renderEditForm.bind(this);
  }

  renderEditForm(props) {
    return <Form {...props} />;
  }

  renderRow() {
    const { products, remove, save } = this.props;

    return products.map(product => (
      <Row key={product._id} product={product} remove={remove} save={save} />
    ));
  }

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

    const actionBarRight = (
      <ModalTrigger title="Add Product / Service" trigger={trigger}>
        {this.renderEditForm({ save })}
      </ModalTrigger>
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
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        footer={<Pagination count={productsCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={productsCount}
            emptyText="There is no data"
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

export default List;
