import { shallow } from 'enzyme';
import React from 'react';

import Content from '../../modules/onboard/components/Content';

describe('Content component', () => {
  const defaultProps = {
    activeStep: 0
  };

  test('renders Content successfully', () => {
    const wrapper = shallow(<Content {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
