import { mount, shallow } from 'enzyme';
import * as React from 'react';

import HeaderDescription from '../../../../modules/common/components/HeaderDescription';

describe('HeaderDescription component', () => {
  const defaultProps = {
    icon: 'email',
    title: 'Email',
    description: 'write your email'
  };

  test('renders HeaderDescription successfully', () => {
    shallow(<HeaderDescription {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<HeaderDescription {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
