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
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';

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
  currencies: string[];
  currentProduct?: string;
  dealQuery: IDeal;
  categories: IProductCategory[];
  loading: boolean;
};

type State = {
  total: { [currency: string]: number };
  unUsedTotal: { [currency: string]: number };
  bothTotal: { [currency: string]: number };
  tax: { [currency: string]: { value?: number; percent?: number } };
  discount: { [currency: string]: { value?: number; percent?: number } };
  vatPercent: number;
  currentTab: string;
  changePayData: { [currency: string]: number };
  tempId: string;
  categoryId?: string;
  filterValues: any;
  advancedView?: boolean;
};

class ProductForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      total: {},
      unUsedTotal: {},
      bothTotal: {},
      discount: {},
      tax: {},
      vatPercent: 0,
      currentTab: 'products',
      changePayData: {},
      tempId: '',
      filterValues: JSON.parse(
        localStorage.getItem('dealProductFormFilter') || '{}'
      )
    };
  }

  componentDidMount() {
    this.updateTotal();
  }

  duplicateProductItem = _id => {
    const { productsData, onChangeProductsData } = this.props;

    const productData: any = productsData.find(p => p._id === _id);

    productsData.push({
      ...productData,
      _id: Math.random().toString()
    });

    onChangeProductsData(productsData);

    for (const productData of productsData) {
      this.calculatePerProductAmount('discount', productData);
    }
  };

  removeProductItem = _id => {
    const { productsData, onChangeProductsData } = this.props;

    const removedProductsData = productsData.filter(p => p._id !== _id);

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
    const unUsedTotal = {};
    const bothTotal = {};
    const tax = {};
    const discount = {};

    productsData.forEach(p => {
      if (p.currency) {
        if (!bothTotal[p.currency]) {
          bothTotal[p.currency] = 0;
        }
        bothTotal[p.currency] += p.amount || 0;

        if (p.tickUsed) {
          if (!total[p.currency]) {
            discount[p.currency] = { percent: 0, value: 0 };
            tax[p.currency] = { percent: 0, value: 0 };
            total[p.currency] = 0;
          }

          discount[p.currency].value += p.discount || 0;
          tax[p.currency].value += p.tax || 0;
          total[p.currency] += p.amount || 0;
        } else {
          if (!unUsedTotal[p.currency]) {
            unUsedTotal[p.currency] = 0;
          }
          unUsedTotal[p.currency] += p.amount || 0;
        }
      }
    });

    for (const currency of Object.keys(discount)) {
      let clearTotal = total[currency] - tax[currency].value;
      tax[currency].percent = (tax[currency].value * 100) / clearTotal;

      clearTotal = clearTotal + discount[currency].value;
      discount[currency].percent =
        (discount[currency].value * 100) / clearTotal;
    }

    this.setState({ total, tax, discount, bothTotal, unUsedTotal });
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

    let filteredProductsData = productsData;

    const { filterValues } = this.state;

    if (filterValues.search) {
      filteredProductsData = filteredProductsData.filter(
        p =>
          p.product &&
          (p.product.name.includes(filterValues.search) ||
            p.product.code.includes(filterValues.search))
      );
    }

    if (filterValues.categories && filterValues.categories.length) {
      filteredProductsData = filteredProductsData.filter(
        p => p.product && filterValues.categories.includes(p.product.categoryId)
      );
    }

    if (filterValues.vendors && filterValues.vendors.length) {
      filteredProductsData = filteredProductsData.filter(
        p => p.product && filterValues.vendors.includes(p.product.vendorId)
      );
    }

    if (filterValues.branches && filterValues.branches.length) {
      filteredProductsData = filteredProductsData.filter(p =>
        filterValues.branches.includes(p.branchId)
      );
    }

    if (filterValues.departments && filterValues.departments.length) {
      filteredProductsData = filteredProductsData.filter(p =>
        filterValues.departments.includes(p.departmentId)
      );
    }

    const { advancedView } = this.state;
    const avStyle = { display: advancedView ? '' : 'none' };

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
              <th style={avStyle}>{__('Tax %')}</th>
              <th style={avStyle}>{__('Tax')}</th>
              <th>{__('Amount')}</th>
              <th style={avStyle}>{__('Currency')}</th>
              <th style={avStyle}>{__('UOM')}</th>
              <th>{__('Is tick used')}</th>
              <th>{__('Is vat applied')}</th>
              <th>{__('Assigned to')}</th>
              <th style={avStyle}>{__('Branch')}</th>
              <th style={avStyle}>{__('Department')}</th>
              <th style={avStyle}>{__('Unit price (global)')}</th>
              <th style={avStyle}>{__('Unit price percent')}</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody id="products">
            {filteredProductsData.map(productData => (
              <ProductItem
                key={productData._id}
                advancedView={advancedView}
                productData={productData}
                duplicateProductItem={this.duplicateProductItem}
                removeProductItem={this.removeProductItem}
                productsData={productsData}
                onChangeProductsData={onChangeProductsData}
                updateTotal={this.updateTotal}
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

  onFilter = (name, value, callback?, params?) => {
    const { filterValues } = this.state;
    this.setState({ filterValues: { ...filterValues, [name]: value } }, () => {
      let otherValues = {};
      if (callback) {
        otherValues = callback(params);
      }

      localStorage.setItem(
        'dealProductFormFilter',
        JSON.stringify({ ...filterValues, [name]: value, ...otherValues })
      );
    });
  };

  onFilterCategory = (childIds?: string[]) => {
    const { filterValues } = this.state;
    this.setState({ filterValues: { ...filterValues, categories: childIds } });
    return { categories: childIds };
  };

  clearFilter = () => {
    this.setState({ filterValues: {} }, () => {
      localStorage.removeItem('dealProductFormFilter');
    });
  };

  renderProductFilter() {
    const { filterValues } = this.state;
    return (
      <FlexRowGap>
        <FormGroup>
          <ControlLabel>By product</ControlLabel>
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={(e: any) => this.onFilter('search', e.target.value)}
            value={filterValues.search}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>By category</ControlLabel>
          <ProductCategoryChooser
            categories={this.props.categories}
            currentId={filterValues.category}
            onChangeCategory={(categoryId, childIds) =>
              this.onFilter(
                'category',
                categoryId,
                this.onFilterCategory,
                childIds
              )
            }
            hasChildIds={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>By branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="branches"
            initialValue={filterValues.branches}
            multi={true}
            onSelect={branchIds => this.onFilter('branches', branchIds)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>By department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="departments"
            initialValue={filterValues.departments}
            multi={true}
            onSelect={departmentIds =>
              this.onFilter('departments', departmentIds)
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>By vendor</ControlLabel>
          <SelectCompanies
            label="Choose vendor"
            name="vendors"
            initialValue={filterValues.vendors}
            multi={true}
            onSelect={companyIds => this.onFilter('vendors', companyIds)}
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
    const { productsData, dealQuery } = this.props;

    const productOnChange = (products: IProduct[]) => {
      this.clearFilter();

      const { onChangeProductsData, currencies } = this.props;

      const { tax, discount } = this.state;
      const currency = currencies ? currencies[0] : '';

      for (const product of products) {
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
          tickUsed: dealQuery.stage?.defaultTick === false ? false : true, // undefined or null then true
          maxQuantity: 0,
          product,
          quantity: 1,
          productId: product._id,
          unitPrice: product.unitPrice,
          globalUnitPrice: product.unitPrice,
          unitPricePercent: 100,
          _id: Math.random().toString()
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
          products: []
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
    const {
      total,
      tax,
      discount,
      currentTab,
      advancedView,
      unUsedTotal,
      bothTotal
    } = this.state;

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

    const avStyle = { display: advancedView ? 'inherit' : 'none' };
    let totalContent = this.renderTotal(total, 'total');
    if (!Object.keys(totalContent).length) {
      totalContent = '--' as any;
    }

    return (
      <FormContainer>
        {this.renderProductFilter()}
        {this.renderContent()}
        {this.renderBulkProductChooser()}

        <FooterInfo>
          <table>
            <tbody>
              <tr style={avStyle}>
                <td>{__('Discount')}:</td>
                <td>{this.renderTotal(discount, 'discount')}</td>
              </tr>
              <tr style={avStyle}>
                <td>{__('Tax')}:</td>
                <td>{this.renderTotal(tax, 'tax')}</td>
              </tr>
              <tr>
                <td>{__('Total')}:</td>
                <td>{totalContent}</td>
              </tr>
              {(Object.keys(unUsedTotal).length && (
                <tr>
                  <td>{__('Un used Total')}:</td>
                  <td>{this.renderTotal(unUsedTotal, 'unUsedTotal')}</td>
                </tr>
              )) ||
                ''}
              {(Object.keys(unUsedTotal).length && (
                <tr>
                  <td>{__('Both Total')}:</td>
                  <td>{this.renderTotal(bothTotal, 'bothTotal')}</td>
                </tr>
              )) ||
                ''}

              <tr>
                <td colSpan={6}>
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

  toggleAdvancedView = () => {
    const { advancedView } = this.state;

    this.setState({ advancedView: !advancedView });
  };

  render() {
    const { advancedView, currentTab } = this.state;

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
            btnStyle="primary"
            icon="plus-circle"
            onClick={this.toggleAdvancedView}
          >
            {advancedView ? 'Compact view' : 'Advanced view'}
          </Button>

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
