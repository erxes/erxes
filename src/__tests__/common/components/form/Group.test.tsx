import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Group from '../../../../modules/common/components/form/Group';

describe('Group component', () => {
  const defaultProps = {
    children: false
  };

  test('renders Group successfully', () => {
    shallow(<Group {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Group {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
