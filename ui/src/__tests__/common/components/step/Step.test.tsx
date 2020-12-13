import { shallow } from 'enzyme';
import React from 'react';

import Step from 'erxes-ui/components/step/Step';

describe('Step component', () => {
  const defaultProps = {
    children: false
  };

  test('renders Step successfully', () => {
    const wrapper = shallow(<Step {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
