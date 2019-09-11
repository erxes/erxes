import { shallow } from 'enzyme';
import React from 'react';

import Summary from '../../modules/insights/components/Summary';

describe('Summary component', () => {
  const defaultProps = {
    data: [],
    loading: false
  };

  test('renders Summary successfully', () => {
    const wrapper = shallow(<Summary {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
