import { mount, shallow } from 'enzyme';
import * as React from 'react';
import MainActionBar from '../../../modules/deals/components/MainActionBar';
import { IBoard } from '../../../modules/deals/types';
import { IProduct } from '../../../modules/settings/productService/types';

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
    onSearch: (search: string) => null,
    onSelect: (values: string[] | string, name: string) => null,
    onDateFilterSelect: (name: string, value: string) => null,
    onClear: (name: string, values) => null,
    isFiltered: () => true,
    clearFilter: () => null,
    boards: testBoards,
    history: 'qwe',
    queryParams: 123,
    products: testProducts
  };

  test('renders successfully', () => {
    shallow(<MainActionBar {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<MainActionBar {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
