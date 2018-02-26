import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Table,
  Button,
  ModalTrigger,
  Pagination
} from 'modules/common/components';
import { Form } from '../containers';
import { Row } from '/';

const propTypes = {
  products: PropTypes.array.isRequired,
  productsCount: PropTypes.number.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
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
    const { save, productsCount } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Product & Service' }
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
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>SKU</th>
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
        content={content}
        footer={<Pagination count={productsCount} />}
      />
    );
  }
}

List.propTypes = propTypes;

export default List;
