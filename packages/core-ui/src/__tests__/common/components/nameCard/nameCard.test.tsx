import { shallow } from 'enzyme';
import React from 'react';

import NameCard from '../../../../modules/common/components/nameCard/NameCard';

describe('NameCard component', () => {
  test('renders NameCard successfully', () => {
    const user = {
      _id: Math.random().toString(),
      username: 'username',
      email: 'email'
    };

    const wrapper = shallow(<NameCard user={user} />);
    expect(wrapper).not.toBe('');
  });
});
