import { shallow } from 'enzyme';
import React from 'react';

import FilterToggler from '../../../modules/inbox/components/leftSidebar/FilterToggler';

describe('FilterToggler component', () => {
  const defaultProps = {
    groupText: 'Channels',
    isOpen: false,

    toggle: (params: { isOpen: boolean }) => null
  };

  test('renders FilterToggler successfully', () => {
    const wrapper = shallow(<FilterToggler {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
