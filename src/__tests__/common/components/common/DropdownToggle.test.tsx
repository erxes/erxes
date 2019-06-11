import { mount, shallow } from 'enzyme';
import * as React from 'react';

import DropdownToggle from '../../../../modules/common/components/DropdownToggle';

describe('DropdownToggle component', () => {
  const defaultProps = {
    children: 'child',
    bsRole: 'Role'
  };

  test('renders DropdownToggle successfully', () => {
    shallow(<DropdownToggle {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<DropdownToggle {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
