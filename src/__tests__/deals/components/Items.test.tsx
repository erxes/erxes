// test passed
import { mount, shallow } from 'enzyme';
import Items from 'modules/deals/components/portable/Items';
import { IProduct } from 'modules/settings/productService/types';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

describe('Items component', () => {
  const testProducts: IProduct[] = [
    {
      _id: 'pro123',
      name: 'qwe',
      type: 's1',
      description: 'blabla',
      sku: 'sku1',
      createdAt: new Date()
    },
    {
      _id: 'pro23',
      name: 'qe',
      type: 's2',
      description: 'blablabla',
      sku: 'sku2',
      createdAt: new Date()
    }
  ];

  const defaultProps = {
    items: testProducts,
    color: 'green'
  };

  test('renders shallow successfully', () => {
    shallow(<Items {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<Items {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Items {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
