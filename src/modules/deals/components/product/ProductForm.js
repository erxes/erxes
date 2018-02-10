import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { Button } from 'modules/common/components';
import { ProductItemForm } from '../';
import { ProductFormContainer, ProductItemList } from '../../styles';

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

  render() {
    return (
      <ProductFormContainer>
        <form onSubmit={e => this.addProduct(e)}>
          <ProductItemList>
            <thead>
              <tr>
                <td>Product & Service</td>
                <td>UOM</td>
                <td>Currency</td>
                <td>Quantity</td>
                <td>Unit Price</td>
                <td>Discount</td>
                <td>Discount amount</td>
                <td>Amount</td>
              </tr>
            </thead>
            <tbody>
              {this.state.products.map(product => (
                <ProductItemForm
                  key={product._id}
                  product={product}
                  removeProduct={() => {}}
                />
              ))}
            </tbody>
          </ProductItemList>

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

            <Button btnStyle="primary" type="submit" name="close" icon="close">
              Save
            </Button>
          </Modal.Footer>
        </form>
      </ProductFormContainer>
    );
  }
}

ProductForm.propTypes = propTypes;
ProductForm.contextTypes = contextTypes;

export default ProductForm;
