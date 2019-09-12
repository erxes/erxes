import { shallow } from 'enzyme';
import React from 'react';

import Wrapper from '../../modules/layout/components/Wrapper';

describe('WithPermission component', () => {
  const defaultProps = {
    content: 'content'
  };

  test('renders Wrapper successfully', () => {
    const wrapper = shallow(<Wrapper {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
