import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import CURRENCIES from '@erxes/ui/src/constants/currencies';
import { __ } from '@erxes/ui/src/utils';
import { MEASUREMENTS } from '@erxes/ui-settings/src/general/constants';
import { IProduct } from '@erxes/ui-products/src/types';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import React from 'react';
import Select from 'react-select-plus';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import {
  Amount,
  ProductButton,
  TypeBox,
  VoucherCard,
  VoucherContainer
} from '../../styles';
import { IDeal, IDiscountValue, IProductData } from '../../types';
import { selectConfigOptions } from '../../utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  advancedView?: boolean;
  uom: string[];
  currencies: string[];
  productsData?: IProductData[];
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  duplicateProductItem?: (productId: string) => void;
  onChangeProductsData?: (productsData: IProductData[]) => void;
  calculatePerProductAmount: (type: string, productData: IProductData) => void;
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

  onChangeCategory = (categoryId: string) => {
    this.setState({ categoryId });
  };

  onChangeField = (type: string, value, _id: string) => {
    const {
      productsData,
      onChangeProductsData,
      calculatePerProductAmount
    } = this.props;

    if (productsData) {
      const productData = productsData.find(p => p._id === _id);

      if (productData) {
        if (type === 'product') {
          const product = value as IProduct;

          productData.unitPrice = product.unitPrice;
          productData.currency =
            productData.currency || this.props.currencies[0];
        }

        if (type === 'unitPricePercent') {
          productData.unitPrice = (productData.globalUnitPrice * value) / 100;
        }

        if (type === 'globalUnitPrice') {
          productData.unitPrice = (value * productData.unitPricePercent) / 100;
        }

        productData[type] = value;
      }

      if (type !== 'uom' && productData) {
        calculatePerProductAmount(type, productData);
      }

      if (onChangeProductsData) {
        onChangeProductsData(productsData);
      }
    }
  };

  renderType = (product: IProduct) => {
    const { type = '' } = product;

    if (!type) {
      return (
        <Tip text={__('Unknown')} placement="left">
          <TypeBox color="#AAAEB3">
            <Icon icon="folder-2" />
          </TypeBox>
        </Tip>
      );
    }

    if (type.includes('product')) {
      return (
        <>
          <Tip text={__('Product')} placement="left">
            <TypeBox color="#3B85F4">
              <Icon icon="box" />
            </TypeBox>
          </Tip>
        </>
      );
    }

    return (
      <>
        <Tip text={__('Service')} placement="left">
          <TypeBox color="#EA475D">
            <Icon icon="invoice" />
          </TypeBox>
        </Tip>
      </>
    );
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
          const variables = {};
          variables.checkInfo = {
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
            <div className="left-dot" />
            <div className="right-dot" />
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
        dialogClassName="modal-1400w"
        size="xl"
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

  placeOnChange = (name, value) => {
    this.onChangeField(name, value, this.props.productData._id);
  };

  changeCurrentProduct = (_id: string) => {
    this.setState({
      currentProduct: this.state.currentProduct === _id ? '' : _id
    });
  };

  changeDiscountPercent = async (productData: any) => {
    const { dealQuery } = this.props;
    const { quantity, product } = productData;

    const variables = {
      _id: dealQuery._id,
      products: [
        {
          productId: product.productId,
          quantity
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

  render() {
    const {
      advancedView,
      productData,
      uom,
      currencies,
      duplicateProductItem,
      removeProductItem
    } = this.props;

    const avStyle = { display: advancedView ? '' : 'none' };

    const selectOption = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    if (!productData.product) {
      return null;
    }

    return (
      <tr key={productData._id}>
        <td>{this.renderType(productData.product)}</td>
        <td>{this.renderProductModal(productData)}</td>
        <td>
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
        </td>
        <td>
          <FormControl
            value={productData.unitPrice || ''}
            type="number"
            placeholder="0"
            name="unitPrice"
            onChange={this.onChange}
          />
        </td>
        <td>
          <FormControl
            value={productData.discountPercent || ''}
            type="number"
            min={0}
            max={100}
            placeholder="0"
            name="discountPercent"
            onChange={this.onChange}
          />
        </td>

        <td>
          <FormControl
            value={productData.discount || ''}
            type="number"
            placeholder="0"
            name="discount"
            onChange={this.onChange}
          />
        </td>
        <td style={avStyle}>
          <FormControl
            defaultValue={productData.taxPercent || ''}
            type="number"
            min={0}
            max={100}
            placeholder="0"
            name="taxPercent"
            onChange={this.onChange}
          />
        </td>
        <td style={avStyle}>
          <Amount>{(productData.tax || 0).toLocaleString()} </Amount>
        </td>

        <td>
          <Amount>
            {(
              productData.quantity * productData.unitPrice -
              (productData.discount || 0)
            ).toLocaleString()}{' '}
          </Amount>
        </td>

        <td style={avStyle}>
          <Select
            name="currency"
            placeholder={__('Choose')}
            value={productData.currency}
            onChange={this.currencyOnChange}
            optionRenderer={selectOption}
            options={selectConfigOptions(currencies, CURRENCIES)}
          />
        </td>
        <td style={avStyle}>
          <Select
            name="uom"
            placeholder={__('Choose')}
            value={productData.uom}
            onChange={this.uomOnChange}
            optionRenderer={selectOption}
            options={selectConfigOptions(uom, MEASUREMENTS)}
          />
        </td>
        <td>
          <FormControl
            componentClass="checkbox"
            checked={productData.tickUsed}
            onChange={this.onTickUse}
          />
        </td>
        <td>
          <FormControl
            componentClass="checkbox"
            disabled={true}
            value={productData.isVatApplied}
            checked={productData.isVatApplied}
          />
        </td>
        <td>
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
        </td>
        <td style={avStyle}>
          <SelectBranches
            label="Choose branch"
            name="branchId"
            multi={false}
            customOption={{
              value: '',
              label: '-----------'
            }}
            initialValue={productData.branchId}
            onSelect={branchId => this.placeOnChange('branchId', branchId)}
          />
        </td>
        <td style={avStyle}>
          <SelectDepartments
            label="Choose department"
            name="departmentId"
            multi={false}
            customOption={{
              value: '',
              label: '-----------'
            }}
            initialValue={productData.departmentId}
            onSelect={departmentId =>
              this.placeOnChange('departmentId', departmentId)
            }
          />
        </td>
        <td style={avStyle}>
          <FormControl
            value={productData.globalUnitPrice || ''}
            type="number"
            placeholder="0"
            name="globalUnitPrice"
            onChange={this.onChange}
          />
        </td>
        <td style={avStyle}>
          <FormControl
            value={productData.unitPricePercent || ''}
            type="number"
            min={0}
            max={100}
            placeholder="0"
            name="unitPricePercent"
            onChange={this.onChange}
          />
        </td>
        <td>
          <Icon
            onClick={removeProductItem?.bind(this, productData._id)}
            icon="times-circle"
          />
        </td>
        <td>
          <Icon
            onClick={duplicateProductItem?.bind(this, productData._id)}
            icon="copy-alt"
          />
        </td>
      </tr>
    );
  }
}

export default ProductItem;
