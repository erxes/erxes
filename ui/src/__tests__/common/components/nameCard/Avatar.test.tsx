import { shallow } from 'enzyme';
import React from 'react';

import Avatar from 'erxes-ui/lib/components/nameCard/Avatar';

describe('Avatar component', () => {
  test('renders Avatar successfully', () => {
    const wrapper = shallow(<Avatar />);
    expect(wrapper).not.toBe('');
  });
});
