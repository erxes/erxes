import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  Icon,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ProductItemForm } from '../';
import {
  ProductFormContainer,
  ProductTable,
  ProductFooter,
  FooterInfo,
  AddProduct
} from '../../styles';

const propTypes = {
  onChangeProductsData: PropTypes.func.isRequired,
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
    this.onChangeSelect = this.onChangeSelect.bind(this);
    this.updateTotal = this.updateTotal.bind(this);

    this.state = {
      total: {},
      subTotal: {},
      discount: {},
      tax: {}
    };
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

  updateTotal() {
    const productsData = this.props.productsData;

    let total = {};
    let subTotal = {};
    let tax = {};
    let discount = {};

    productsData.forEach(p => {
      if (p.currency) {
        if (total[p.currency]) {
          total[p.currency] += p.amount;
          subTotal[p.currency] += p.amount - p.tax || 0 - p.discount || 0;
          tax[p.currency] += p.tax;
          discount[p.currency] += p.discount;
        } else {
          total[p.currency] = p.amount;
          subTotal[p.currency] = p.amount - p.tax || 0 - p.discount || 0;
          tax[p.currency] = p.tax;
          discount[p.currency] = p.discount;
        }
      }
    });

    this.setState({
      total,
      subTotal,
      tax,
      discount
    });
  }

  onChangeSelect(selected, _id, type) {
    const productsData = this.props.productsData;

    const productData = productsData.find(p => p._id === _id);
    productData[type] = selected ? selected.value : '';

    if (productData.amount > 0 && type === 'currency') {
      this.updateTotal();
    }

    this.props.onChangeProductsData(productsData);
  }

  onChangeInput(_id, type, e) {
    const productsData = this.props.productsData;

    const product = productsData.find(p => p._id === _id);
    product[type] = e.target.value;

    if (type === 'quantity' || type === 'unitPrice') {
      product.amount = product.unitPrice * product.quantity;

      if (product.amount > 0) {
        product.discountPercent = product.discount * 100 / product.amount;
        product.discount = product.amount * product.discountPercent / 100;
        product.tax =
          (product.amount - product.discount || 0) * product.taxPercent / 100;
      }
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

    if (product.amount > 0) {
      this.updateTotal();
    }

    this.props.onChangeProductsData(productsData);
  }

  render() {
    const { total, subTotal, tax, discount } = this.state;
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
          <FooterInfo>
            <FormGroup>
              <ControlLabel>Notes</ControlLabel>
              <FormControl componentClass="textarea" />
            </FormGroup>
            <table>
              <tbody>
                <tr>
                  <td>Sub total:</td>
                  <td>
                    {Object.keys(subTotal).map(s => (
                      <div key={s}>
                        {subTotal[s]} {s}
                      </div>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td>Tax:</td>
                  <td>
                    {Object.keys(tax).map(t => (
                      <div key={t}>
                        {tax[t]} {t}
                      </div>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td>Discount:</td>
                  <td>
                    {Object.keys(discount).map(d => (
                      <div key={d}>
                        {discount[d]} {d}
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
                          {total[t]} {t}
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
