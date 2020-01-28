import { shallow } from 'enzyme';
import React from 'react';

import Group from '../../../../modules/common/components/form/Group';

describe('Group component', () => {
  const defaultProps = {
    children: false
  };

  test('renders Group successfully', () => {
    const wrapper = shallow(<Group {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
