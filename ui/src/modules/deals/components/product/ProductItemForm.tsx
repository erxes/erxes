import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
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
  AssignUser,
  ContentColumn,
  ContentRow,
  ItemText,
  ProductButton,
  ProductItem,
  TickUsed,
  TotalAmount
} from '../../styles';
import { IProductData } from '../../types';
import { selectConfigOptions } from '../../utils';

type Props = {
  uom: string[];
  currencies: string[];
  productsData?: IProductData[];
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  onChangeProductsData?: (productsData: IProductData[]) => void;
  updateTotal?: () => void;
};

class ProductItemForm extends React.Component<Props, { categoryId: string }> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: ''
    };
  }

  componentDidMount = () => {
    // default select first item
    const { uom, currencies, productData } = this.props;

    if (uom.length > 0 && !productData.uom) {
      this.onChangeField('uom', uom[0], productData._id);
    }

    if (currencies.length > 0 && !productData.currency) {
      this.onChangeField('currency', currencies[0], productData._id);
    }
  };

  calculateAmount = (type: string, productData: IProductData) => {
    const amount = productData.unitPrice * productData.quantity;

    if (amount > 0) {
      switch (type) {
        case 'discount': {
          productData.discountPercent = (productData.discount * 100) / amount;
          break;
        }
        case 'discountPercent': {
          productData.discount = (amount * productData.discountPercent) / 100;
          break;
        }
        default: {
          productData.discountPercent = (productData.discount * 100) / amount;
          productData.discount = (amount * productData.discountPercent) / 100;
        }
      }

      productData.tax =
        ((amount - productData.discount || 0) * productData.taxPercent) / 100;
      productData.amount =
        amount - (productData.discount || 0) + (productData.tax || 0);
    } else {
      productData.tax = 0;
      productData.taxPercent = 0;
      productData.discount = 0;
      productData.discountPercent = 0;
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
    this.onChangeField('assignUserId', userId, this.props.productData._id);
  };

  render() {
    const { uom, currencies, productData } = this.props;

    const selectOption = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    return (
      <ProductItem key={productData._id}>
        <ContentRow>
          <ContentColumn>
            <ControlLabel>Product / Service</ControlLabel>
            {this.renderProductModal(productData)}
            <br />
            <ContentRow>
              <ContentColumn>
                <ControlLabel>UOM</ControlLabel>
                <Select
                  name="uom"
                  placeholder={__('Choose')}
                  value={productData.uom}
                  onChange={this.uomOnChange}
                  optionRenderer={selectOption}
                  options={selectConfigOptions(uom, MEASUREMENTS)}
                />
              </ContentColumn>

              <ContentColumn>
                <ControlLabel>Currency</ControlLabel>
                <Select
                  name="currency"
                  placeholder={__('Choose')}
                  value={productData.currency}
                  onChange={this.currencyOnChange}
                  optionRenderer={selectOption}
                  options={selectConfigOptions(currencies, CURRENCIES)}
                />
              </ContentColumn>
            </ContentRow>

            <TickUsed>
              <ContentRow>
                <ControlLabel>tick paid or used</ControlLabel>
              </ContentRow>
              <ContentRow>
                <FormControl
                  componentClass="checkbox"
                  checked={productData.tickUsed}
                  onChange={this.onTickUse}
                />
              </ContentRow>
            </TickUsed>

            <AssignUser>
              <ContentRow>
                <ControlLabel>Assigned to</ControlLabel>
              </ContentRow>
              <ContentRow>
                <SelectTeamMembers
                  label="Choose assigned user"
                  name="assignedUserId"
                  multi={false}
                  customOption={{
                    value: '',
                    label: '-----------'
                  }}
                  value={productData.assignUserId || ''}
                  onSelect={this.assignUserOnChange}
                />
              </ContentRow>
            </AssignUser>
          </ContentColumn>

          <ContentColumn>
            <ContentRow>
              <ContentColumn>
                <ControlLabel>Quantity</ControlLabel>
                <FormControl
                  defaultValue={productData.quantity}
                  type="number"
                  min={1}
                  placeholder="0"
                  name="quantity"
                  onChange={this.onChange}
                />
              </ContentColumn>

              <ContentColumn>
                <ControlLabel>Unit price</ControlLabel>
                <FormControl
                  value={productData.unitPrice}
                  type="number"
                  placeholder="0"
                  name="unitPrice"
                  onChange={this.onChange}
                />
              </ContentColumn>

              <ContentColumn>
                <ControlLabel>Amount</ControlLabel>
                <ItemText>
                  {(
                    productData.quantity * productData.unitPrice
                  ).toLocaleString()}{' '}
                  <b>{productData.currency}</b>
                </ItemText>
              </ContentColumn>
            </ContentRow>
            <br />
            <ContentRow>
              <ContentColumn>
                <ItemText align="right">
                  <b>{__('Discount')} </b>
                  <span>%</span>
                </ItemText>
              </ContentColumn>

              <ContentColumn>
                <FormControl
                  value={productData.discountPercent || ''}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  name="discountPercent"
                  onChange={this.onChange}
                />
              </ContentColumn>

              <ContentColumn>
                <FormControl
                  value={productData.discount || ''}
                  type="number"
                  placeholder="0"
                  name="discount"
                  onChange={this.onChange}
                />
              </ContentColumn>
            </ContentRow>

            <ContentRow>
              <ContentColumn>
                <ItemText align="right">
                  <b>{__('Tax')} </b>
                  <span>%</span>
                </ItemText>
              </ContentColumn>

              <ContentColumn>
                <FormControl
                  defaultValue={productData.taxPercent || ''}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  name="taxPercent"
                  onChange={this.onChange}
                />
              </ContentColumn>

              <ContentColumn>
                <ItemText>
                  {(productData.tax || 0).toLocaleString()}{' '}
                  <b>{productData.currency}</b>
                </ItemText>
              </ContentColumn>
            </ContentRow>

            <TotalAmount>
              {productData.amount.toLocaleString()}{' '}
              <b>{productData.currency}</b>
            </TotalAmount>
          </ContentColumn>
        </ContentRow>

        <Button btnStyle="link" icon="times" onClick={this.onClick} />
      </ProductItem>
    );
  }
}

export default ProductItemForm;
