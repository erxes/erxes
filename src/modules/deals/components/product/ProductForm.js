import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { Button, Icon } from 'modules/common/components';
import { ProductItemForm } from '../../containers';
import {
  ProductFormContainer,
  ProductTable,
  ProductFooter,
  AddProduct
} from '../../styles';

const propTypes = {
  onChangeProductsData: PropTypes.func.isRequired,
  productsData: PropTypes.array
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class ProductForm extends React.Component {
  constructor(props) {
    super(props);

    this.addProductItem = this.addProductItem.bind(this);
    this.removeProductItem = this.removeProductItem.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onChangeSelect = this.onChangeSelect.bind(this);
  }

  addProductItem() {
    const productsData = this.props.productsData;
    productsData.push({
      _id: Math.random(),
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      taxPercent: 0,
      discount: 0,
      discountPercent: 0,
      amount: 0
    });

    this.props.onChangeProductsData(productsData);
  }

  removeProductItem(_id) {
    const productsData = this.props.productsData;

    const removedProductsData = productsData.filter(p => p._id !== _id);

    this.props.onChangeProductsData(removedProductsData);
  }

  onChangeSelect(_id, type, e) {
    const productsData = this.props.productsData;

    const product = productsData.find(p => p._id === _id);
    product[type] = e.target.value;

    this.props.onChangeProductsData(productsData);
  }

  onChangeInput(_id, type, e) {
    const productsData = this.props.productsData;

    const product = productsData.find(p => p._id === _id);
    product[type] = e.target.value;

    if (type === 'quantity' || type === 'unitPrice') {
      product.amount = product.unitPrice * product.quantity;
      product.discountPercent = product.discount * 100 / product.amount;
      product.discount = product.amount * product.discountPercent / 100;
      product.tax =
        (product.amount - product.discount || 0) * product.taxPercent / 100;
    } else if (product.amount > 0) {
      switch (type) {
        case 'discount': {
          product.discountPercent = product.discount * 100 / product.amount;
          break;
        }
        case 'discountPercent': {
          product.discount = product.amount * product.discountPercent / 100;
          break;
        }
        case 'taxPercent': {
          product.tax =
            (product.amount - product.discount || 0) * product.taxPercent / 100;
          break;
        }
        default:
      }
    }

    this.props.onChangeProductsData(productsData);
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
              {this.props.productsData.map(product => (
                <ProductItemForm
                  key={product._id}
                  product={product}
                  onChangeSelect={this.onChangeSelect}
                  onChangeInput={this.onChangeInput}
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
