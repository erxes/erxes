import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import CURRENCIES from 'modules/common/constants/currencies';
import { __ } from 'modules/common/utils';
import { MEASUREMENTS } from 'modules/settings/general/constants';
import { IProduct } from 'modules/settings/productService/types';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Select from 'react-select-plus';
import ProductChooser from '../../containers/product/ProductChooser';
import {
  Amount,
  ContentColumn,
  ContentRow,
  ItemRow,
  ItemText,
  Measure,
  ProductButton,
  ProductItemContainer,
  ProductSettings
} from '../../styles';
import { IProductData } from '../../types';
import { selectConfigOptions } from '../../utils';
import ProductRow from './ProductRow';

type Props = {
  uom: string[];
  currencies: string[];
  productsData?: IProductData[];
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  onChangeProductsData?: (productsData: IProductData[]) => void;
  updateTotal?: () => void;
  currentProduct?: string;
};

type State = {
  categoryId: string;
  currentProduct: string;
};

class ProductItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: '',
      currentProduct: props.currentProduct
    };
  }

  componentDidMount = () => {
    // default select item
    const { uom, currencies, productData } = this.props;

    if (uom.length > 0 && !productData.uom) {
      this.onChangeField('uom', uom[0], productData._id);
    }

    if (currencies.length > 0 && !productData.currency) {
      this.onChangeField('currency', currencies[0], productData._id);
    }

    // select previous assignee when add new product
    const tempAssignee = localStorage.getItem('temporaryAssignee');
    if (!productData.assignUserId && tempAssignee && !productData.product) {
      this.onChangeField('assignUserId', tempAssignee, productData._id);
    }
  };

  calculateAmount = (type: string, productData: IProductData) => {
    const amount = productData.unitPrice * productData.quantity;

    if (amount > 0) {
      if (type === 'discount') {
        productData.discountPercent = (productData.discount * 100) / amount;
      } else {
        productData.discount = (amount * productData.discountPercent) / 100;
      }

      productData.tax =
        ((amount - productData.discount || 0) * productData.taxPercent) / 100;
      productData.amount =
        amount - (productData.discount || 0) + (productData.tax || 0);
    } else {
      productData.tax = 0;
      productData.discount = 0;
      productData.amount = 0;
    }

    const { updateTotal } = this.props;

    if (updateTotal) {
      updateTotal();
    }
  };

  onChangeCategory = (categoryId: string) => {
    this.setState({ categoryId });
  };

  onChangeField = (
    type: string,
    value: string | boolean | IProduct,
    productId: string
  ) => {
    const { productsData, onChangeProductsData } = this.props;

    if (productsData) {
      const productData = productsData.find(p => p._id === productId);
      if (productData) {
        if (type === 'product') {
          const product = value as IProduct;

          productData.unitPrice = product.unitPrice;
          productData.currency =
            productData.currency || this.props.currencies[0];
        }

        productData[type] = value;
      }

      if (type !== 'uom' && productData) {
        this.calculateAmount(type, productData);
      }

      if (onChangeProductsData) {
        onChangeProductsData(productsData);
      }
    }
  };

  renderProductServiceTrigger(product?: IProduct) {
    let content = (
      <div>
        {__('Choose Product & Service')} <Icon icon="plus-circle" />
      </div>
    );

    // if product selected
    if (product) {
      content = (
        <div>
          {product.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <ProductButton>{content}</ProductButton>;
  }

  renderProductModal(productData: IProductData) {
    const productOnChange = (products: IProduct[]) => {
      const product = products && products.length === 1 ? products[0] : null;

      if (product) {
        this.onChangeField('product', product, productData._id);
        this.changeCurrentProduct(product._id);
      }
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        onChangeCategory={this.onChangeCategory}
        categoryId={this.state.categoryId}
        data={{
          name: 'Product',
          products: productData.product ? [productData.product] : []
        }}
        limit={1}
      />
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={this.renderProductServiceTrigger(productData.product)}
        size="lg"
        content={content}
      />
    );
  }

  uomOnChange = (option: HTMLOptionElement) =>
    this.onChangeField(
      'uom',
      option ? option.value : '',
      this.props.productData._id
    );

  currencyOnChange = (currency: HTMLOptionElement) =>
    this.onChangeField(
      'currency',
      currency ? currency.value : '',
      this.props.productData._id
    );

  onChange = e =>
    this.onChangeField(
      (e.target as HTMLInputElement).name,
      (e.target as HTMLInputElement).value,
      this.props.productData._id
    );

  onClick = () => {
    const { productData, removeProductItem } = this.props;

    return removeProductItem && removeProductItem(productData._id);
  };

  onTickUse = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;

    this.onChangeField('tickUsed', isChecked, this.props.productData._id);
  };

  assignUserOnChange = userId => {
    localStorage.setItem('temporaryAssignee', userId);
    this.onChangeField('assignUserId', userId, this.props.productData._id);
  };

  changeCurrentProduct = (productId: string) => {
    this.setState({
      currentProduct: this.state.currentProduct === productId ? '' : productId
    });
  };

  renderForm = () => {
    const { productData, uom, currencies } = this.props;
    const selectOption = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    if (
      !productData.product ||
      this.state.currentProduct === productData.product._id
    ) {
      return (
        <ProductItemContainer key={productData._id}>
          <ContentRow>
            <ProductSettings>
              <ItemRow>
                <ItemText>{__('Tick paid or used')}:</ItemText>
                <ContentColumn flex="3">
                  <FormControl
                    componentClass="checkbox"
                    checked={productData.tickUsed}
                    onChange={this.onTickUse}
                  />
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('UOM')}:</ItemText>
                <ContentColumn flex="3">
                  <Select
                    name="uom"
                    placeholder={__('Choose')}
                    value={productData.uom}
                    onChange={this.uomOnChange}
                    optionRenderer={selectOption}
                    options={selectConfigOptions(uom, MEASUREMENTS)}
                  />
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('Currency')}:</ItemText>
                <ContentColumn flex="3">
                  <Select
                    name="currency"
                    placeholder={__('Choose')}
                    value={productData.currency}
                    onChange={this.currencyOnChange}
                    optionRenderer={selectOption}
                    options={selectConfigOptions(currencies, CURRENCIES)}
                  />
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('Assigned to')}:</ItemText>
                <ContentColumn flex="3">
                  <SelectTeamMembers
                    label="Choose assigned user"
                    name="assignedUserId"
                    multi={false}
                    customOption={{
                      value: '',
                      label: '-----------'
                    }}
                    value={productData.assignUserId}
                    onSelect={this.assignUserOnChange}
                  />
                </ContentColumn>
              </ItemRow>
            </ProductSettings>
            <ContentColumn>
              <ItemRow>
                <ItemText>{__('Choose Product')}:</ItemText>
                <ContentColumn flex="3">
                  {this.renderProductModal(productData)}
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('Quantity')}:</ItemText>
                <ContentColumn flex="3">
                  <FormControl
                    defaultValue={productData.quantity || 0}
                    type="number"
                    min={1}
                    placeholder="0"
                    name="quantity"
                    onChange={this.onChange}
                  />
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('Unit price')}:</ItemText>
                <ContentColumn flex="3">
                  <FormControl
                    value={productData.unitPrice || ''}
                    type="number"
                    placeholder="0"
                    name="unitPrice"
                    onChange={this.onChange}
                  />
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('Amount')}:</ItemText>
                <ContentColumn flex="3">
                  <Amount>
                    {(
                      productData.quantity * productData.unitPrice
                    ).toLocaleString()}{' '}
                    <b>{productData.currency}</b>
                  </Amount>
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('Discount')}:</ItemText>
                <ContentColumn flex="3">
                  <ContentRow>
                    <ContentColumn>
                      <ContentRow>
                        <FormControl
                          value={productData.discountPercent || ''}
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0"
                          name="discountPercent"
                          onChange={this.onChange}
                        />
                        <Measure>%</Measure>
                      </ContentRow>
                    </ContentColumn>
                    <ContentColumn flex="2">
                      <ContentRow>
                        <FormControl
                          value={productData.discount || ''}
                          type="number"
                          placeholder="0"
                          name="discount"
                          onChange={this.onChange}
                        />
                        <Measure>{productData.currency}</Measure>
                      </ContentRow>
                    </ContentColumn>
                  </ContentRow>
                </ContentColumn>
              </ItemRow>

              <ItemRow>
                <ItemText>{__('Tax')}:</ItemText>
                <ContentColumn flex="3">
                  <ContentRow>
                    <ContentColumn>
                      <ContentRow>
                        <FormControl
                          defaultValue={productData.taxPercent || ''}
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0"
                          name="taxPercent"
                          onChange={this.onChange}
                        />
                        <Measure>%</Measure>
                      </ContentRow>
                    </ContentColumn>
                    <ContentColumn flex="2">
                      <Amount>
                        {(productData.tax || 0).toLocaleString()}{' '}
                        <b>{productData.currency}</b>
                      </Amount>
                    </ContentColumn>
                  </ContentRow>
                </ContentColumn>
              </ItemRow>
            </ContentColumn>
          </ContentRow>
        </ProductItemContainer>
      );
    }

    return null;
  };

  render() {
    const { productData } = this.props;

    return (
      <ProductRow
        key={productData._id}
        onRemove={this.onClick}
        activeProduct={this.state.currentProduct}
        productData={productData}
        changeCurrentProduct={this.changeCurrentProduct}
      >
        {this.renderForm()}
      </ProductRow>
    );
  }
}

export default ProductItem;
