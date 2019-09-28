import { shallow } from 'enzyme';
import React from 'react';

import NameCard from '../../../../modules/common/components/nameCard/NameCard';

describe('NameCard component', () => {
  test('renders NameCard successfully', () => {
    const wrapper = shallow(<NameCard />);
    expect(wrapper).not.toBe('');
  });
});
