import { mount, shallow } from 'enzyme';
import * as React from 'react';

import NameCard from '../../../../../modules/common/components/nameCard/NameCard';

describe('NameCard component', () => {
  test('renders NameCard successfully', () => {
    shallow(<NameCard />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<NameCard />);
    wrapper.props();
  });
});
