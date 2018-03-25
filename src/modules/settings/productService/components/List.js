import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Table,
  Button,
  ModalTrigger,
  Pagination,
  DataWithLoader
} from 'modules/common/components';
import { Form, Row } from './';

const propTypes = {
  products: PropTypes.array.isRequired,
  productsCount: PropTypes.number.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

class List extends Component {
  constructor(props) {
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
    const { __ } = this.context;
    const { save, productsCount, loading } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service') }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="plus">
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

List.propTypes = propTypes;
List.contextTypes = {
  __: PropTypes.func
};

export default List;
