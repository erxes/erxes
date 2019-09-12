import { shallow } from 'enzyme';
import React from 'react';

import Header from '../../modules/layout/components/Header';

describe('Header component', () => {
  const defaultProps = {
    title: 'default'
  };

  test('renders Header successfully', () => {
    const wrapper = shallow(<Header {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
