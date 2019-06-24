import { Button, EmptyState } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import { IProduct } from 'modules/settings/productService/types';
import * as React from 'react';
import { ProductItemForm } from '../../containers';
import { Add, FooterInfo, FormContainer } from '../../styles';
import { IProductData } from '../../types';

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  saveProductsData: () => void;
  productsData: IProductData[];
  products: IProduct[];
  closeModal: () => void;
};

type State = {
  total: { currency?: string; amount?: number };
  tax: { currency?: string; tax?: number };
  discount: { currency?: string; discount?: number };
};

class ProductForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      total: {},
      discount: {},
      tax: {}
    };
  }

  componentWillMount() {
    this.updateTotal();

    // initial product item
    if (this.props.productsData.length === 0) {
      this.addProductItem();
    }
  }

  addProductItem = () => {
    const { productsData, onChangeProductsData } = this.props;

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

    onChangeProductsData(productsData);
  };

  removeProductItem = productId => {
    const { productsData, onChangeProductsData } = this.props;

    const removedProductsData = productsData.filter(p => p._id !== productId);

    onChangeProductsData(removedProductsData);

    this.updateTotal();
  };

  updateTotal = () => {
    const { productsData } = this.props;

    const total = {};
    const tax = {};
    const discount = {};

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
  };

  renderTotal(value) {
    return Object.keys(value).map(key => (
      <div key={key}>
        {value[key].toLocaleString()} <b>{key}</b>
      </div>
    ));
  }

  renderContent() {
    const { productsData, onChangeProductsData } = this.props;

    if (productsData.length === 0) {
      return (
        <tr>
          <td colSpan={7}>
            <EmptyState text="No product or services" icon="shoppingcart" />
          </td>
        </tr>
      );
    }

    return productsData.map(productData => (
      <ProductItemForm
        key={productData._id}
        productData={productData}
        removeProductItem={this.removeProductItem}
        productsData={productsData}
        onChangeProductsData={onChangeProductsData}
        updateTotal={this.updateTotal}
      />
    ));
  }

  onClick = () => {
    const { saveProductsData, productsData, closeModal } = this.props;

    if (productsData.length !== 0) {
      for (const data of productsData) {
        if (!data.product) {
          return Alert.error('Please choose a product');
        }

        if (!data.unitPrice) {
          return Alert.error('Please enter an unit price');
        }

        if (!data.currency) {
          return Alert.error('Please choose a currency');
        }
      }
    }

    saveProductsData();
    closeModal();
  };

  render() {
    const { total, tax, discount } = this.state;

    return (
      <FormContainer>
        {this.renderContent()}
        <Add>
          <Button btnStyle="success" onClick={this.addProductItem} icon="add">
            Add Product / Service
          </Button>
        </Add>
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
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" onClick={this.onClick} icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </FormContainer>
    );
  }
}

export default ProductForm;
