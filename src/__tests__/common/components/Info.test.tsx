import { shallow } from 'enzyme';
import React from 'react';

import Info from '../../../modules/common/components/Info';

describe('Info component', () => {
  const defaultProps = {
    children: 'child'
  };

  test('renders Info successfully', () => {
    const wrapper = shallow(<Info {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
