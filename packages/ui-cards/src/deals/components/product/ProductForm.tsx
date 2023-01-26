import { Add, FlexRowGap, FooterInfo, FormContainer } from '../../styles';
import { Alert, __ } from '@erxes/ui/src/utils';
import {
  ControlLabel,
  FormGroup,
  ModalTrigger,
  Table
} from '@erxes/ui/src/components';
import { IDeal, IPaymentsData, IProductData } from '../../types';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';

import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IProduct } from '@erxes/ui-products/src/types';
import { IProductCategory } from '@erxes/ui-products/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import PaymentForm from './PaymentForm';
import ProductCategoryChooser from '@erxes/ui-products/src/components/ProductCategoryChooser';
import ProductItem from '../../containers/product/ProductItem';
import ProductTotal from './ProductTotal';
import React from 'react';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';

import styled from 'styled-components';

const TableWrapper = styled.div`
  table thead tr th {
    font-size: 10px;
  }
`;

const ApplyVatWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;

  > div {
    flex: inherit;
  }

  input {
    width: 100px;
  }
`;

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  saveProductsData: () => void;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  productsData: IProductData[];
  products: IProduct[];
  paymentsData?: IPaymentsData;
  closeModal: () => void;
  uom: string[];
  currencies: string[];
  currentProduct?: string;
  dealQuery: IDeal;
  categories: IProductCategory[];
  loading: boolean;
};

type State = {
  total: { [currency: string]: number };
  tax: { [currency: string]: { value?: number; percent?: number } };
  discount: { [currency: string]: { value?: number; percent?: number } };
  vatPercent: number;
  currentTab: string;
  changePayData: { [currency: string]: number };
  tempId: string;
  categoryId?: string;
  filterProductSearch: string;
  filterProductCategoryId: string;
};

class ProductForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      total: {},
      discount: {},
      tax: {},
      vatPercent: 0,
      currentTab: 'products',
      changePayData: {},
      tempId: '',
      filterProductCategoryId:
        localStorage.getItem('dealProductFormCategoryId') || '',
      filterProductSearch: localStorage.getItem('dealProductFormSearch') || ''
    };
  }

  componentDidMount() {
    this.updateTotal();
  }

  removeProductItem = productId => {
    const { productsData, onChangeProductsData } = this.props;

    const removedProductsData = productsData.filter(p => p._id !== productId);

    onChangeProductsData(removedProductsData);

    this.updateTotal(removedProductsData);
  };

  setDiscount = (id, discount) => {
    const { productsData, onChangeProductsData } = this.props;

    const discountAdded = productsData.map(p =>
      p.product?._id === id ? { ...p, discountPercent: discount } : p
    );

    onChangeProductsData(discountAdded);

    this.updateTotal(discountAdded);
  };

  onChangeVatPercent = e => {
    this.setState({ vatPercent: parseInt(e.currentTarget.value) });
  };

  applyVat = () => {
    const { productsData, onChangeProductsData } = this.props;
    const { vatPercent } = this.state;

    const updatedData = productsData.map(p => {
      const pData = {
        ...p,
        isVatApplied: true,
        unitPrice: p.isVatApplied
          ? p.unitPrice
          : parseFloat(
              ((p.unitPrice * 100) / (100 + (vatPercent || 0))).toFixed(4)
            )
      };

      this.calculatePerProductAmount('', pData, false);

      return pData;
    });

    onChangeProductsData(updatedData);

    this.updateTotal(updatedData);
  };

  updateTotal = (productsData = this.props.productsData) => {
    const total = {};
    const tax = {};
    const discount = {};

    productsData.forEach(p => {
      if (p.currency && p.tickUsed) {
        if (!total[p.currency]) {
          discount[p.currency] = { percent: 0, value: 0 };
          tax[p.currency] = { percent: 0, value: 0 };
          total[p.currency] = 0;
        }

        discount[p.currency].value += p.discount || 0;
        tax[p.currency].value += p.tax || 0;
        total[p.currency] += p.amount || 0;
      }
    });

    for (const currency of Object.keys(discount)) {
      let clearTotal = total[currency] - tax[currency].value;
      tax[currency].percent = (tax[currency].value * 100) / clearTotal;

      clearTotal = clearTotal + discount[currency].value;
      discount[currency].percent =
        (discount[currency].value * 100) / clearTotal;
    }

    this.setState({ total, tax, discount });
  };

  renderTotal(totalKind, kindTxt) {
    const { productsData, onChangeProductsData } = this.props;

    return Object.keys(totalKind).map(currency => (
      <ProductTotal
        key={kindTxt.concat(currency)}
        totalKind={totalKind[currency]}
        kindTxt={kindTxt}
        currency={currency}
        productsData={productsData}
        updateTotal={this.updateTotal}
        onChangeProductsData={onChangeProductsData}
      />
    ));
  }

  renderContent() {
    const {
      productsData,
      onChangeProductsData,
      currentProduct,
      dealQuery
    } = this.props;

    if (productsData.length === 0) {
      return (
        <EmptyState size="full" text="No product or services" icon="box" />
      );
    }

    const filterSearch = localStorage.getItem('dealProductFormSearch');
    const filterParentCategory = localStorage.getItem(
      'dealProductFormCategoryId'
    );
    const filterCategoryIds = JSON.parse(
      localStorage.getItem('dealProductFormCategoryIds') || '[]'
    );

    let filteredProductsData = productsData;

    if (filterSearch) {
      filteredProductsData = filteredProductsData.filter(
        p =>
          p.product &&
          (p.product.name.includes(filterSearch) ||
            p.product.code.includes(filterSearch))
      );
    }

    if (filterParentCategory && filterCategoryIds.length > 0) {
      filteredProductsData = filteredProductsData.filter(p => {
        if (p.product) {
          return filterCategoryIds.find(_id => _id === p.product?.categoryId);
        }
      });
    }

    return (
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>{__('Type')}</th>
              <th>{__('Product / Service')}</th>
              <th style={{ width: '30px' }}>{__('Quantity')}</th>
              <th>{__('Unit price')}</th>
              <th style={{ width: '90px' }}>{__('Discount %')}</th>
              <th>{__('Discount')}</th>
              <th style={{ width: '50px' }}>{__('Tax %')}</th>
              <th>{__('Tax')}</th>
              <th>{__('Amount')}</th>
              <th>{__('Currency')}</th>
              <th>{__('UOM')}</th>
              <th>{__('Is tick used')}</th>
              <th>{__('Is vat applied')}</th>
              <th>{__('Assigned to')}</th>
              <th />
            </tr>
          </thead>
          <tbody id="products">
            {filteredProductsData.map(productData => (
              <ProductItem
                key={productData._id}
                productData={productData}
                removeProductItem={this.removeProductItem}
                productsData={productsData}
                onChangeProductsData={onChangeProductsData}
                updateTotal={this.updateTotal}
                uom={this.props.uom}
                currencies={this.props.currencies}
                currentProduct={currentProduct}
                onChangeDiscount={this.setDiscount}
                calculatePerProductAmount={this.calculatePerProductAmount}
                dealQuery={dealQuery}
              />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );
  }

  calcChangePay = () => {
    const { paymentsData } = this.props;
    const { total } = this.state;

    const changePayData = Object.assign({}, total);
    const payments = paymentsData || {};

    Object.keys(payments || {}).forEach(key => {
      const perPaid = payments[key];
      const currency = perPaid.currency || '';

      if (Object.keys(changePayData).includes(currency)) {
        changePayData[currency] =
          changePayData[currency] - (perPaid.amount || 0);
      } else {
        if (perPaid.currency && perPaid.amount) {
          changePayData[currency] = -(perPaid.amount || 0);
        }
      }
    });

    this.setState({ changePayData });
  };

  onClick = () => {
    const { saveProductsData, productsData, closeModal } = this.props;

    const { total, changePayData } = this.state;

    if (productsData.length !== 0) {
      for (const data of productsData) {
        if (!data.product) {
          return Alert.error('Please choose a product');
        }

        if (!data.unitPrice && data.unitPrice !== 0) {
          return Alert.error(
            'Please enter an unit price. It should be a number'
          );
        }

        if (!data.currency) {
          return Alert.error('Please choose a currency');
        }

        if (
          data.product.type === 'service' &&
          data.tickUsed &&
          !data.assignUserId
        ) {
          return Alert.error('Please choose a Assigned to any service');
        }
      }
    }

    if (
      Object.keys(total).length > 0 &&
      Object.keys(changePayData).length > 0
    ) {
      let alertMsg = '';
      for (const key of Object.keys(changePayData)) {
        // warning greater pay
        if (changePayData[key] > 0) {
          alertMsg =
            alertMsg + `Greater than total: ${changePayData[key]} ${key},`;
        }

        // warning less pay
        if (changePayData[key] < 0) {
          alertMsg =
            alertMsg + `Less than total: ${changePayData[key]} ${key},`;
        }
      }

      if (alertMsg) {
        Alert.warning('Change payment has problem: (' + alertMsg + ')');
      }
    }

    saveProductsData();
    closeModal();
  };

  onFilterSearch = (e: any) => {
    const searchText = e.target.value;
    localStorage.setItem('dealProductFormSearch', searchText);
    this.setState({ filterProductSearch: searchText });
  };

  onFilterCategory = (categoryId: string, childIds?: string[]) => {
    localStorage.setItem(
      'dealProductFormCategoryIds',
      JSON.stringify(childIds || [])
    );
    localStorage.setItem('dealProductFormCategoryId', categoryId);
    this.setState({ filterProductCategoryId: categoryId });
  };

  clearFilter = () => {
    localStorage.setItem('dealProductFormCategoryIds', '');
    localStorage.setItem('dealProductFormCategoryId', '');
    localStorage.setItem('dealProductFormSearch', '');
    this.setState({ filterProductCategoryId: '', filterProductSearch: '' });
  };

  renderProductFilter() {
    return (
      <FlexRowGap>
        <FormGroup>
          <ControlLabel>Filter by product</ControlLabel>
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={this.onFilterSearch}
            value={localStorage.getItem('dealProductFormSearch')}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Filter by category</ControlLabel>
          <ProductCategoryChooser
            categories={this.props.categories}
            currentId={this.state.filterProductCategoryId}
            onChangeCategory={this.onFilterCategory}
            hasChildIds={true}
          />
        </FormGroup>
        <Button
          btnStyle="simple"
          onClick={this.clearFilter}
          icon="times-circle"
          size="small"
        >
          Clear filter
        </Button>
      </FlexRowGap>
    );
  }

  onChangeCategory = (categoryId: string) => {
    this.setState({ categoryId });
  };

  calculatePerProductAmount = (
    type: string,
    productData: IProductData,
    callUpdateTotal = true
  ) => {
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

    if (callUpdateTotal) {
      this.updateTotal();
    }
  };

  renderBulkProductChooser() {
    const { productsData } = this.props;

    const productOnChange = (products: IProduct[]) => {
      this.clearFilter();
      const { onChangeProductsData, currencies } = this.props;
      const { tax, discount } = this.state;
      const currency = currencies ? currencies[0] : '';

      const currentProductIds = productsData.map(p => p.productId);

      for (const product of products) {
        if (currentProductIds.includes(product._id)) {
          continue;
        }

        productsData.push({
          tax: 0,
          taxPercent: tax[currency] ? tax[currency].percent || 0 : 0,
          discount: 0,
          vatPercent: 0,
          discountPercent: discount[currency]
            ? discount[currency].percent || 0
            : 0,
          amount: 0,
          currency,
          tickUsed: true,
          maxQuantity: 0,
          product,
          quantity: 1,
          productId: product._id,
          unitPrice: product.unitPrice,
          _id: product._id
        });
      }

      onChangeProductsData(productsData);

      for (const productData of productsData) {
        this.calculatePerProductAmount('discount', productData);
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
          products: productsData.filter(p => p.product).map(p => p.product)
        }}
      />
    );

    const trigger = (
      <Add>
        <Button btnStyle="primary" icon="plus-circle">
          Add Product / Service
        </Button>
      </Add>
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={trigger}
        dialogClassName="modal-1400w"
        size="xl"
        content={content}
      />
    );
  }

  renderTabContent() {
    const { total, tax, discount, currentTab } = this.state;

    if (currentTab === 'payments') {
      const { onChangePaymentsData } = this.props;

      return (
        <PaymentForm
          total={total}
          payments={this.props.paymentsData}
          onChangePaymentsData={onChangePaymentsData}
          currencies={this.props.currencies}
          calcChangePay={this.calcChangePay}
          changePayData={this.state.changePayData}
        />
      );
    }

    return (
      <FormContainer>
        {this.renderProductFilter()}
        {this.renderContent()}
        {this.renderBulkProductChooser()}

        <FooterInfo>
          <table>
            <tbody>
              <tr>
                <td>{__('Discount')}:</td>
                <td>{this.renderTotal(discount, 'discount')}</td>
              </tr>
              <tr>
                <td>{__('Tax')}:</td>
                <td>{this.renderTotal(tax, 'tax')}</td>
              </tr>
              <tr>
                <td>{__('Total')}:</td>
                <td>{this.renderTotal(total, 'total')}</td>
              </tr>

              <tr>
                <td />
                <td>
                  <ApplyVatWrapper>
                    <FormControl
                      placeholder="Vat percent"
                      type="number"
                      onChange={this.onChangeVatPercent}
                    />

                    <Button
                      btnStyle="primary"
                      icon="plus-circle"
                      onClick={this.applyVat}
                    >
                      Apply vat
                    </Button>
                  </ApplyVatWrapper>
                </td>
              </tr>
            </tbody>
          </table>
        </FooterInfo>
      </FormContainer>
    );
  }

  onTabClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <Tabs grayBorder={true} full={true}>
          <TabTitle
            className={currentTab === 'products' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'products')}
          >
            <Icon icon="box" />
            {__('Products')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'payments' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'payments')}
          >
            <Icon icon="atm-card" />
            {__('Payments')}
          </TabTitle>
        </Tabs>

        {this.renderTabContent()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>

          <Button btnStyle="success" onClick={this.onClick} icon="check-circle">
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default ProductForm;
