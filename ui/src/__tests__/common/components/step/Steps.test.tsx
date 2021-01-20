import { shallow } from 'enzyme';
import React from 'react';

import Steps from '../../../../modules/common/components/step/Steps';

describe('Group component', () => {
  const defaultProps = {
    children: [],
    active: 0
  };

  test('renders Steps successfully', () => {
    const wrapper = shallow(<Steps {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
