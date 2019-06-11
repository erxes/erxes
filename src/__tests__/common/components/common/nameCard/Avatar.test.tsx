import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Avatar from '../../../../../modules/common/components/nameCard/Avatar';

describe('Avatar component', () => {
  test('renders Avatar successfully', () => {
    shallow(<Avatar />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Avatar />);

    wrapper.props();
  });
});
