import { mount, shallow } from 'enzyme';
import * as React from 'react';

import TextInfo from '../../../../modules/common/components/TextInfo';

describe('TextInfo component', () => {
  const defaultProps = {
    children: 'child'
  };

  test('renders TextInfo successfully', () => {
    shallow(<TextInfo {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<TextInfo {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
