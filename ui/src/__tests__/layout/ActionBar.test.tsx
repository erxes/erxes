import { shallow } from 'enzyme';
import React from 'react';

import ActionBar from '../../modules/layout/components/ActionBar';

describe('ActionBar component', () => {
  const defaultProps = {
    background: 'black'
  };

  test('renders ActionBar successfully', () => {
    const wrapper = shallow(<ActionBar {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
