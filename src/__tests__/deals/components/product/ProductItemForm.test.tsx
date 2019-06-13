// test failed info: TypeError: Cannot read property 'label' of undefined
import { mount, shallow } from 'enzyme';
import ProductItemForm from 'modules/deals/components/product/ProductItemForm';
import { IProductData } from 'modules/deals/types';
import * as React from 'react';

describe('ProductItemForm component', () => {
  const testProductDatas: IProductData[] = [
    {
      _id: 'pd12',
      quantity: 2,
      unitPrice: 1000,
      taxPercent: 5,
      tax: 345,
      discountPercent: 10,
      discount: 20,
      amount: 5
    },
    {
      _id: 'pd11',
      quantity: 3,
      unitPrice: 2000,
      taxPercent: 6,
      tax: 347,
      discountPercent: 11,
      discount: 25,
      amount: 9
    }
  ];

  const defaultProps = {
    uom: ['abc', 'bca'],
    currencies: ['dollar', 'peso'],
    productData: testProductDatas[0]
  };

  test('renders shallow successfully', () => {
    shallow(<ProductItemForm {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<ProductItemForm {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
