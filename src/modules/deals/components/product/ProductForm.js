import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { Button, Icon } from 'modules/common/components';
import { ProductItemForm } from '../';
import {
  ProductFormContainer,
  ProductTable,
  ProductFooter,
  AddProduct
} from '../../styles';

const propTypes = {
  addProduct: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class ProductForm extends React.Component {
  constructor(props) {
    super(props);

    this.addProduct = this.addProduct.bind(this);
    this.addProductItem = this.addProductItem.bind(this);
    this.removeProductItem = this.removeProductItem.bind(this);

    this.state = {
      products: [
        {
          _id: 'asdf',
          product: 'product1'
        }
      ]
    };
  }

  addProduct(e) {
    e.preventDefault();
  }

  addProductItem() {
    const products = this.state.products;
    products.push({
      _id: Math.random(),
      product: 'product2'
    });

    this.setState({
      products
    });
  }

  removeProductItem(_id) {
    const products = this.state.products;

    this.setState({
      products: products.filter(product => product._id !== _id)
    });
  }

  render() {
    return (
      <ProductFormContainer>
        <form onSubmit={e => this.addProduct(e)}>
          <ProductTable>
            <thead>
              <tr>
                <td width="200">Product & Service</td>
                <td width="120">UOM</td>
                <td>Currency</td>
                <td>Quantity</td>
                <td>Unit Price</td>
                <td>Amount</td>
              </tr>
            </thead>
            <tbody>
              {this.state.products.map(product => (
                <ProductItemForm
                  key={product._id}
                  product={product}
                  removeProductItem={this.removeProductItem}
                />
              ))}
            </tbody>
          </ProductTable>
          <AddProduct onClick={this.addProductItem}>
            <Icon icon="plus" /> Add a new product & service
          </AddProduct>
          <ProductFooter>
            <Modal.Footer>
              <Button
                btnStyle="simple"
                onClick={() => {
                  this.context.closeModal();
                }}
                icon="close"
              >
                Close
              </Button>

              <Button
                btnStyle="primary"
                type="submit"
                name="close"
                icon="close"
              >
                Save
              </Button>
            </Modal.Footer>
          </ProductFooter>
        </form>
      </ProductFormContainer>
    );
  }
}

ProductForm.propTypes = propTypes;
ProductForm.contextTypes = contextTypes;

export default ProductForm;
