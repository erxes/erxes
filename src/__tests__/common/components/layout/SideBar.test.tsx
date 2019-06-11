import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Sidebar from '../../../../modules/layout/components/Sidebar';

describe('Sidebar component', () => {
  const defaultProps = {
    children: 'child'
  };

  test('renders Sidebar successfully', () => {
    shallow(<Sidebar {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Sidebar {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
