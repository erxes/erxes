import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, EmptyState } from 'modules/common/components';
import { ProductItemForm } from '../../containers';
import { FormContainer, Add, Footer, FooterInfo } from '../../styles/product';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  onChangeProductsData: PropTypes.func.isRequired,
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
    this.updateTotal = this.updateTotal.bind(this);

    this.state = {
      total: {},
      discount: {},
      tax: {}
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

  renderTotal(value) {
    return Object.keys(value).map(key => (
      <div key={key}>
        <b>
          {value[key].toLocaleString()} {key}
        </b>
      </div>
    ));
  }

  renderEmpty(products) {
    if (products.length === 0) {
      return (
        <tr>
          <td colSpan="7">
            <EmptyState text="No product or services" icon="shoppingcart" />
          </td>
        </tr>
      );
    }

    return null;
  }

  render() {
    const { __ } = this.context;
    const { total, tax, discount } = this.state;
    const { productsData, saveProductsData, onChangeProductsData } = this.props;

    return (
      <FormContainer>
        <Table alignTop={true}>
          <thead>
            <tr>
              <th width="250">{__('Product & Service')}</th>
              <th width="200">{__('UOM')}</th>
              <th width="220">{__('Currency')}</th>
              <th width="100">{__('Quantity')}</th>
              <th>{__('Unit price')}</th>
              <th>{__('Amount')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {productsData.map(productData => (
              <ProductItemForm
                key={productData._id}
                productData={productData}
                removeProductItem={this.removeProductItem}
                productsData={productsData}
                onChangeProductsData={onChangeProductsData}
                updateTotal={this.updateTotal}
              />
            ))}
            {this.renderEmpty(productsData)}
          </tbody>
        </Table>

        <Add>
          <Button
            btnStyle="success"
            onClick={this.addProductItem}
            icon="add"
            size="large"
          >
            Add Product / Service
          </Button>
        </Add>
        <Footer>
          <FooterInfo>
            <table>
              <tbody>
                <tr>
                  <td>{__('Tax')}:</td>
                  <td>{this.renderTotal(tax)}</td>
                </tr>
                <tr>
                  <td>{__('Discount')}:</td>
                  <td>{this.renderTotal(discount)}</td>
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
              icon="cancel-1"
            >
              Close
            </Button>

            <Button
              btnStyle="success"
              onClick={() => {
                saveProductsData();
                this.context.closeModal();
              }}
              icon="checked-1"
            >
              Save
            </Button>
          </ModalFooter>
        </Footer>
      </FormContainer>
    );
  }
}

ProductForm.propTypes = propTypes;
ProductForm.contextTypes = contextTypes;

export default ProductForm;
