import { shallow } from 'enzyme';
import React from 'react';

import Filter from 'erxes-ui/lib/components/filterableList/Filter';

describe('Filter component', () => {
  const defaultProps = {
    onChange: (e: React.FormEvent<HTMLElement>) => null
  };

  test('renders Filter successfully', () => {
    const wrapper = shallow(<Filter {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
