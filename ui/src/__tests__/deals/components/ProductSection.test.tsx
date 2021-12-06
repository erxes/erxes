import { shallow } from 'enzyme';
import ProductSection from 'modules/deals/components/ProductSection';
import { IPaymentsData, IProductData } from 'modules/deals/types';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';

describe('ProductSection component', () => {
  const category = {
    _id: 'id',
    order: 'order',
    code: 'code',
    name: 'categoryName',
    productCount: 1,
    isRoot: true,
    status: 'status',
    createdAt: new Date()
  };

  const testProducts: IProduct[] = [
    {
      _id: 'pro123',
      name: 'qwe',
      type: 's1',
      description: 'blabla',
      sku: 'sku1',
      categoryId: 'categoryId',
      category,
      code: '123',
      unitPrice: 123,
      supply: '',
      productCount: 0,
      minimiumCount: 0,
      createdAt: new Date()
    },
    {
      _id: 'pro23',
      name: 'qe',
      type: 's2',
      description: 'blablabla',
      sku: 'sku2',
      categoryId: 'categoryId',
      category,
      code: '321',
      unitPrice: 123,
      supply: '',
      productCount: 0,
      minimiumCount: 0,
      createdAt: new Date()
    }
  ];

  const testProductDatas: IProductData[] = [
    {
      _id: 'pd12',
      quantity: 2,
      unitPrice: 1000,
      taxPercent: 5,
      tax: 345,
      discountPercent: 10,
      discount: 20,
      amount: 5,
      tickUsed: true
    },
    {
      _id: 'pd11',
      quantity: 3,
      unitPrice: 2000,
      taxPercent: 6,
      tax: 347,
      discountPercent: 11,
      discount: 25,
      amount: 9,
      tickUsed: true
    }
  ];

  const testPaymentsData: IPaymentsData = {
    cash: { amount: 1000, currency: 'MNT' }
  };

  const defaultProps = {
    productsData: testProductDatas,
    products: testProducts,
    paymentsData: testPaymentsData,
    onChangeProductsData: (productsData: IProductData[]) => null,
    onChangePaymentsData: (paymentsData: IPaymentsData) => null,
    onChangeProducts: (prs: IProduct[]) => null,
    saveProductsData: () => null
  };

  test('renders shallow successfully', () => {
    const wrapper = shallow(<ProductSection {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
