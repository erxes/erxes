import { mount, shallow } from 'enzyme';
import * as React from 'react';

import WithPermission from '../../../modules/common/components/WithPermission';

describe('WithPermission component', () => {
  const defaultProps = {
    action: '',
    children: false
  };

  test('renders WithPermission successfully', () => {
    shallow(<WithPermission {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<WithPermission {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
