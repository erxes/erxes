import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import CURRENCIES from '@erxes/ui/src/constants/currencies';
import { __ } from '@erxes/ui/src/utils';
import { MEASUREMENTS } from '@erxes/ui-settings/src/general/constants';
import { IProduct } from '@erxes/ui-products/src/types';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import React from 'react';
import Select from 'react-select-plus';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import {
  Amount,
  ContentColumn,
  ItemRow,
  ItemText,
  Measure,
  ProductButton,
  ProductItemContainer,
  ProductSettings,
  VoucherCard,
  VoucherContainer
} from '../../styles';
import { IDeal, IDiscountValue, IProductData } from '../../types';
import { selectConfigOptions } from '../../utils';
import ProductRow from './ProductRow';
import { Flex } from '@erxes/ui/src/styles/main';
import { isEnabled } from '@erxes/ui/src/utils/core';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import { queries } from '../../graphql';

type Props = {
  uom: string[];
  currencies: string[];
  productsData?: IProductData[];
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  onChangeProductsData?: (productsData: IProductData[]) => void;
  updateTotal?: () => void;
  currentProduct?: string;
  dealQuery: IDeal;
  confirmLoyalties: any;
};

type State = {
  categoryId: string;
  currentProduct: string;
  currentDiscountVoucher: any;
  isSelectedVoucher: boolean;
  discountValue?: IDiscountValue;
};

class ProductItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: '',
      currentProduct: props.currentProduct,
      currentDiscountVoucher: null,
      isSelectedVoucher: false,
      discountValue: {
        bonusName: '',
        discount: 0,
        potentialBonus: 0,
        sumDiscount: 0,
        type: '',
        voucherCampaignId: '',
        voucherId: '',
        voucherName: ''
      }
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
    if (isEnabled('loyalties') && productData.product) {
      this.changeDiscountPercent(productData);
      this.toggleVoucherCardChecBox();
    }
  };

  toggleVoucherCardChecBox = () => {
    this.setState(prevState => ({
      ...prevState,
      isSelectedVoucher: !prevState.isSelectedVoucher
    }));
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
    value: string | boolean | IProduct | number,
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
        if (isEnabled('loyalties') && this.state.isSelectedVoucher === true) {
          const { confirmLoyalties } = this.props;
          const { discountValue } = this.state;
          let variables = {};
          variables['checkInfo'] = {
            [product._id]: {
              voucherId: discountValue?.voucherId,
              count: 1
            }
          };
          confirmLoyalties(variables);
          if (discountValue?.type === 'bonus') {
            this.onChangeField('discountPercent', 100, productData._id);
            this.onChangeField(
              'maxQuantity',
              discountValue?.potentialBonus || 0,
              productData._id
            );
          } else {
            this.onChangeField(
              'discountPercent',
              discountValue?.discount || 0,
              productData._id
            );
          }
        }
      }
    };
    const VoucherDiscountCard = () => {
      const { isSelectedVoucher, discountValue } = this.state;

      const Discountcard = ({ percentage, name, type }) => {
        return (
          <VoucherCard>
            <FormControl
              componentClass="checkbox"
              checked={isSelectedVoucher}
              onChange={() => this.toggleVoucherCardChecBox()}
            />
            <div className="text-container">
              <div className="text-discount">
                <div>{`-${percentage}%`}</div>
                <Icon icon="pricetag-alt" />
              </div>
              <div className="text-voucher-name">{`${name} ${type
                .substring(0, 1)
                .toUpperCase()}${type.substring(1)} Voucher`}</div>
            </div>
            <div className="left-dot"></div>
            <div className="right-dot"></div>
          </VoucherCard>
        );
      };

      return (
        discountValue && (
          <VoucherContainer>
            {discountValue.potentialBonus > 0 ? (
              <Discountcard
                percentage={100}
                name={discountValue?.bonusName}
                type="bonus"
              />
            ) : discountValue.discount > 0 ? (
              <Discountcard
                percentage={discountValue?.discount}
                name={discountValue?.voucherName}
                type="discount"
              />
            ) : (
              ''
            )}
          </VoucherContainer>
        )
      );
    };
    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        onChangeCategory={this.onChangeCategory}
        categoryId={this.state.categoryId}
        loadDiscountPercent={this.changeDiscountPercent}
        renderExtra={VoucherDiscountCard}
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

  changeCurrentProduct = (productId: string) => {
    this.setState({
      currentProduct: this.state.currentProduct === productId ? '' : productId
    });
  };

  changeDiscountPercent = async (productData: any) => {
    const { dealQuery } = this.props;
    const { quantity, product } = productData;

    const variables = {
      _id: dealQuery._id,
      products: [
        {
          productId: product._id,
          quantity: quantity
        }
      ]
    };
    client
      .query({
        query: gql(queries.checkDiscount),
        fetchPolicy: 'network-only',
        variables
      })
      .then(res => {
        const { checkDiscount } = res.data;
        if (checkDiscount !== null) {
          const result: IDiscountValue = Object.values(
            checkDiscount
          )[0] as IDiscountValue;
          return this.setState({ discountValue: result });
        }
        this.setState({
          discountValue: {
            bonusName: '',
            discount: 0,
            potentialBonus: 0,
            sumDiscount: 0,
            type: '',
            voucherCampaignId: '',
            voucherId: '',
            voucherName: ''
          }
        });
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
          <Flex>
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
                    initialValue={productData.assignUserId}
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
                    max={
                      productData?.maxQuantity > 0
                        ? productData?.maxQuantity
                        : undefined
                    }
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
                  <Flex>
                    <ContentColumn>
                      <Flex>
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
                      </Flex>
                    </ContentColumn>
                    <ContentColumn flex="2">
                      <Flex>
                        <FormControl
                          value={productData.discount || ''}
                          type="number"
                          placeholder="0"
                          name="discount"
                          onChange={this.onChange}
                        />
                        <Measure>{productData.currency}</Measure>
                      </Flex>
                    </ContentColumn>
                  </Flex>
                </ContentColumn>
              </ItemRow>

              <ItemRow>
                <ItemText>{__('Tax')}:</ItemText>
                <ContentColumn flex="3">
                  <Flex>
                    <ContentColumn>
                      <Flex>
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
                      </Flex>
                    </ContentColumn>
                    <ContentColumn flex="2">
                      <Amount>
                        {(productData.tax || 0).toLocaleString()}{' '}
                        <b>{productData.currency}</b>
                      </Amount>
                    </ContentColumn>
                  </Flex>
                </ContentColumn>
              </ItemRow>
            </ContentColumn>
          </Flex>
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
