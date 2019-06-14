// test failed info: expect(received).toMatchObject(expected)
import { mount, shallow } from 'enzyme';
import MainActionBar from 'modules/deals/components/MainActionBar';
import { IBoard } from 'modules/deals/types';
import { IProduct } from 'modules/settings/productService/types';
import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

describe('MainActionBar component', () => {
  const testBoards: IBoard[] = [
    {
      _id: 'qwe124',
      name: 'qwertu'
    },
    {
      _id: 'qwe123',
      name: 'qwerty'
    }
  ];

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
    onSearch: (search: string) => false,
    onSelect: (values: string[] | string, name: string) => false,
    onDateFilterSelect: (name: string, value: string) => false,
    onClear: (name: string, values) => false,
    isFiltered: () => true,
    clearFilter: () => false,
    boards: testBoards,
    history: window,
    queryParams: 123,
    products: testProducts
  };

  test('renders successfully', () => {
    shallow(
      <Router>
        <MainActionBar {...defaultProps} />
      </Router>
    );
  });

  test('renders with default props', () => {
    const control = mount(
      <Router>
        <MainActionBar {...defaultProps} />
      </Router>
    );
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
