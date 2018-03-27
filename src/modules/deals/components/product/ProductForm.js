import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, EmptyState } from 'modules/common/components';
import { ProductItemForm } from '../../containers';
import {
  ProductFormContainer,
  ProductFooter,
  FooterInfo,
  AddProduct
} from '../../styles';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  onChangeProductsData: PropTypes.func.isRequired,
  onChangeProducts: PropTypes.func.isRequired,
  saveProductsData: PropTypes.func.isRequired,
  productsData: PropTypes.array,
  products: PropTypes.array
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
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
      tax: {},
      products: props.products || []
    };
  }

  componentDidMount() {
    this.updateTotal();

    // initial product item
    if (this.props.productsData.length === 0) {
      this.addProductItem();
    }
  }

  addProductItem() {
    const { productsData } = this.props;

    productsData.push({
      _id: Math.random().toString(),
      quantity: 1,
      unitPrice: '',
      tax: '',
      taxPercent: '',
      discount: '',
      discountPercent: '',
      amount: ''
    });

    this.props.onChangeProductsData(productsData);
  }

  removeProductItem(_id) {
    const { productsData } = this.props;

    const removedProductsData = productsData.filter(p => p._id !== _id);

    this.props.onChangeProductsData(removedProductsData);

    this.updateTotal();
  }

  updateTotal() {
    const { productsData } = this.props;

    let total = {};
    let tax = {};
    let discount = {};

    productsData.forEach(p => {
      if (p.currency) {
        if (!total[p.currency]) {
          total[p.currency] = 0;
          tax[p.currency] = 0;
          discount[p.currency] = 0;
        }

        total[p.currency] += p.amount || 0;
        tax[p.currency] += p.tax || 0;
        discount[p.currency] += p.discount || 0;
      }
    });

    this.setState({ total, tax, discount });
  }

  onChangeProduct(product, _id) {
    const { productsData } = this.props;

    const productData = productsData.find(p => p._id === _id);

    productData.product = product;

    this.props.onChangeProductsData(productsData);
  }

  onChangeUom(selected, _id) {
    const { productsData } = this.props;

    const productData = productsData.find(p => p._id === _id);
    productData.uom = selected ? selected.value : '';

    this.props.onChangeProductsData(productsData);
  }

  onChangeCurrency(selected, _id) {
    const { productsData } = this.props;

    const productData = productsData.find(p => p._id === _id);
    productData.currency = selected ? selected.value : '';

    if (productData.amount > 0) {
      this.updateTotal();
    }

    this.props.onChangeProductsData(productsData);
  }

  onChangeInput(_id, e) {
    const { productsData } = this.props;
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
      product.amount = amount - (product.discount || 0) - (product.tax || 0);
    } else {
      product.tax = 0;
      product.taxPercent = 0;
      product.discount = 0;
      product.discountPercent = 0;
      product.amount = 0;
    }

    this.updateTotal();

    this.props.onChangeProductsData(productsData);
  }

  renderTax(tax) {
    return Object.keys(tax).map(key => (
      <div key={key}>
        {tax[key].toLocaleString()} {key}
      </div>
    ));
  }

  renderDiscount(discount) {
    return Object.keys(discount).map(key => (
      <div key={key}>
        {discount[key].toLocaleString()} {key}
      </div>
    ));
  }

  renderTotal(total) {
    return Object.keys(total).map(key => (
      <div key={key}>
        <b>
          {total[key].toLocaleString()} {key}
        </b>
      </div>
    ));
  }

  renderEmpty(products) {
    if (products.length === 0) {
      return (
        <tr>
          <td colSpan="7">
            <EmptyState
              text="No product or services"
              icon="information-circled"
            />
          </td>
        </tr>
      );
    }

    return null;
  }

  render() {
    const { __ } = this.context;
    const { total, tax, discount } = this.state;
    const products = this.props.productsData;

    return (
      <ProductFormContainer>
        <Table alignTop={true}>
          <thead>
            <tr>
              <th width="250">{__('Product & Service')}</th>
              <th width="200">{__('UOM')}</th>
              <th width="200">{__('Currency')}</th>
              <th width="100">{__('Quantity')}</th>
              <th>{__('Unit price')}</th>
              <th>{__('Amount')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map(productData => (
              <ProductItemForm
                key={productData._id}
                productData={productData}
                onChangeProduct={this.onChangeProduct}
                onChangeCurrency={this.onChangeCurrency}
                onChangeUom={this.onChangeUom}
                onChangeInput={this.onChangeInput}
                removeProductItem={this.removeProductItem}
              />
            ))}
            {this.renderEmpty(products)}
          </tbody>
        </Table>

        <AddProduct>
          <Button
            btnStyle="success"
            onClick={this.addProductItem}
            icon="plus"
            size="large"
          >
            Add Product / Service
          </Button>
        </AddProduct>
        <ProductFooter>
          <FooterInfo>
            <table>
              <tbody>
                <tr>
                  <td>{__('Tax')}:</td>
                  <td>{this.renderTax(tax)}</td>
                </tr>
                <tr>
                  <td>{__('Discount')}:</td>
                  <td>{this.renderDiscount(discount)}</td>
                </tr>
                <tr>
                  <td>{__('Total')}:</td>
                  <td>{this.renderTotal(total)}</td>
                </tr>
              </tbody>
            </table>
          </FooterInfo>

          <ModalFooter>
            <Button
              btnStyle="simple"
              onClick={() => this.context.closeModal()}
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
          </ModalFooter>
        </ProductFooter>
      </ProductFormContainer>
    );
  }
}

ProductForm.propTypes = propTypes;
ProductForm.contextTypes = contextTypes;

export default ProductForm;
