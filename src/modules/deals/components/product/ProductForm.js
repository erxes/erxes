import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { Button, Icon } from 'modules/common/components';
import { ProductItemForm } from '../../containers';
import {
  ProductFormContainer,
  ProductTable,
  ProductFooter,
  FooterInfo,
  AddProduct
} from '../../styles';

const propTypes = {
  onChangeProductsData: PropTypes.func.isRequired,
  saveProductsData: PropTypes.func.isRequired,
  productsData: PropTypes.array,
  products: PropTypes.array
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
    this.onChangeProduct = this.onChangeProduct.bind(this);
    this.onChangeUom = this.onChangeUom.bind(this);
    this.onChangeCurrency = this.onChangeCurrency.bind(this);
    this.updateTotal = this.updateTotal.bind(this);

    this.state = {
      total: {},
      discount: {},
      tax: {}
    };
  }

  addProductItem() {
    const productsData = this.props.productsData;
    productsData.push({
      _id: Math.random().toString(),
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

  updateTotal() {
    const productsData = this.props.productsData;

    let total = {};
    let tax = {};
    let discount = {};

    productsData.forEach(p => {
      if (p.currency) {
        if (total[p.currency]) {
          total[p.currency] += p.amount;
          tax[p.currency] += p.tax;
          discount[p.currency] += p.discount;
        } else {
          total[p.currency] = p.amount;
          tax[p.currency] = p.tax;
          discount[p.currency] = p.discount;
        }
      }
    });

    this.setState({
      total,
      tax,
      discount
    });
  }

  onChangeProduct(products, _id) {
    const productsData = this.props.productsData;

    const productData = productsData.find(p => p._id === _id);

    productData.product = products && products.length > 0 ? products[0] : null;

    this.props.onChangeProductsData(productsData);
  }

  onChangeUom(selected, _id) {
    const productsData = this.props.productsData;

    const productData = productsData.find(p => p._id === _id);
    productData.uom = selected ? selected.value : '';

    this.props.onChangeProductsData(productsData);
  }

  onChangeCurrency(selected, _id) {
    const productsData = this.props.productsData;

    const productData = productsData.find(p => p._id === _id);
    productData.currency = selected ? selected.value : '';

    if (productData.amount > 0) {
      this.updateTotal();
    }

    this.props.onChangeProductsData(productsData);
  }

  onChangeInput(_id, e) {
    const productsData = this.props.productsData;
    const name = e.target.name;

    const product = productsData.find(p => p._id === _id);
    product[name] = e.target.value;

    const amount = product.unitPrice * product.quantity;

    if (amount > 0) {
      switch (name) {
        case 'discount': {
          product.discountPercent = product.discount * 100 / amount;
          break;
        }
        case 'discountPercent': {
          product.discount = amount * product.discountPercent / 100;
          break;
        }
        default: {
          product.discountPercent = product.discount * 100 / amount;
          product.discount = amount * product.discountPercent / 100;
        }
      }

      product.tax = (amount - product.discount || 0) * product.taxPercent / 100;
      product.amount = amount - (product.discount || 0) + (product.tax || 0);

      this.updateTotal();
    }

    this.props.onChangeProductsData(productsData);
  }

  render() {
    const { total, tax, discount } = this.state;

    return (
      <ProductFormContainer>
        <ProductTable>
          <thead>
            <tr>
              <td>Product & Service</td>
              <td width="120">UOM</td>
              <td width="120">Currency</td>
              <td width="100">Quantity</td>
              <td width="140">Unit Price</td>
              <td width="120">Amount</td>
            </tr>
          </thead>
          <tbody>
            {this.props.productsData.map(product => (
              <ProductItemForm
                key={product._id}
                product={product}
                products={this.props.products}
                onChangeProduct={this.onChangeProduct}
                onChangeCurrency={this.onChangeCurrency}
                onChangeUom={this.onChangeUom}
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
          <FooterInfo>
            <table>
              <tbody>
                <tr>
                  <td>Tax:</td>
                  <td>
                    {Object.keys(tax).map(t => (
                      <div key={t}>
                        {tax[t].toLocaleString()} {t}
                      </div>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td>Discount:</td>
                  <td>
                    {Object.keys(discount).map(d => (
                      <div key={d}>
                        {discount[d].toLocaleString()} {d}
                      </div>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td>Total:</td>
                  <td>
                    {Object.keys(total).map(t => (
                      <div key={t}>
                        <b>
                          {total[t].toLocaleString()} {t}
                        </b>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </FooterInfo>
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
              btnStyle="success"
              onClick={() => {
                this.props.saveProductsData();
                this.context.closeModal();
              }}
              icon="checkmark"
            >
              Save
            </Button>
          </Modal.Footer>
        </ProductFooter>
      </ProductFormContainer>
    );
  }
}

ProductForm.propTypes = propTypes;
ProductForm.contextTypes = contextTypes;

export default ProductForm;
