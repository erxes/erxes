import { shallow } from 'enzyme';
import React from 'react';

import TextDivider from '../../../modules/common/components/TextDivider';

describe('TextDivider component', () => {
  const defaultProps = {
    text: 'today',
    date: new Date()
  };

  test('renders TextDivider successfully', () => {
    const wrapper = shallow(<TextDivider {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
