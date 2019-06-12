import { mount, shallow } from 'enzyme';
import * as React from 'react';

import * as renderer from 'react-test-renderer';
import DropdownToggle from '../../../modules/common/components/DropdownToggle';

describe('DropdownToggle component', () => {
  const defaultProps = {
    children: 'child',
    bsRole: 'Role'
  };

  test('renders DropdownToggle successfully', () => {
    shallow(<DropdownToggle {...defaultProps} />);
  });

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<DropdownToggle {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<DropdownToggle {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
