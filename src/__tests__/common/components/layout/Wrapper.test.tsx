import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Wrapper from '../../../../modules/layout/components/Wrapper';

describe('WithPermission component', () => {
  const defaultProps = {
    content: 'content'
  };

  test('renders Wrapper successfully', () => {
    shallow(<Wrapper {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Wrapper {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
